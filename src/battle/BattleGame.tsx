import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Copy,
  Download,
  Flame,
  Gamepad2,
  Heart,
  MapPin,
  Maximize2,
  MessageCircle,
  Play,
  RotateCcw,
  Settings2,
  ShoppingBag,
  Share2,
  Shield,
  Star,
  Swords,
  Trophy,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import {
  FIGHTERS,
  EPISODES,
  FICTION,
  boss,
  fighter,
  episode,
  type FighterId,
  type EpisodeId,
} from "./content";
import { applyChoice, applyShopPowerup, createWorld, type GameEvent, type World } from "./engine";
import { defaultSave, loadSave, saveResult, writeSave, type Save } from "./persistence";
import { Scene } from "./Scene";
import { challengeUrl, downloadCard, resultCard, type ShareResult } from "./share";
import { Intro } from "./Intro";
import { Leaderboard } from "./LeaderboardPanel";
import { BrandLogo } from "./BrandLogo";
import { ShopPanel } from "./ShopPanel";
import type { ShopSku } from "./shop-catalog";
import {
  claimScoreRewards,
  consumeReward,
  emptyRewardWallet,
  loadRewardWallet,
  rewardStock,
  writeRewardWallet,
  type RewardWallet,
} from "./rewards";
import { chatWithNpc, type AgentTurn } from "../game/agent";
import { configureAudio, installMobileAudioUnlock, unlockAudio, sfx } from "../game/audio";
import "./battle.css";

type Screen = "home" | "fighters" | "episodes" | "brief" | "play" | "result";
type Dialog = "settings" | "help" | "pause" | "talk" | "share" | "ranking" | "shop" | null;
const formatTime = (time: number) =>
  `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, "0")}`;
const statStyle = (color: string) => ({ "--fighter-color": color }) as CSSProperties;
export function BattleGame() {
  const [screen, setScreen] = useState<Screen>("home");
  const [dialog, setDialog] = useState<Dialog>(null);
  const [save, setSave] = useState<Save>(defaultSave);
  const [level, setLevel] = useState<EpisodeId>(1);
  const [world, setWorld] = useState<World | null>(null);
  const [won, setWon] = useState(false);
  const [npc, setNpc] = useState<FighterId>("secre");
  const [toast, setToast] = useState("");
  const [seed, setSeed] = useState(20260919);
  const [challenge, setChallenge] = useState(false);
  const [stored, setStored] = useState(true);
  const [shareBlob, setShareBlob] = useState<Blob | null>(null);
  const [shareImage, setShareImage] = useState("");
  const [shareError, setShareError] = useState("");
  const [intro, setIntro] = useState(true);
  const [rankingName, setRankingName] = useState("");
  const [rewards, setRewards] = useState<RewardWallet>(emptyRewardWallet);
  const [ownedSkus, setOwnedSkus] = useState<ShopSku[]>([]);
  const [usedOwnedSkus, setUsedOwnedSkus] = useState<ShopSku[]>([]);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3500);
  };
  useEffect(() => {
    const local = loadSave();
    setSave(local);
    setRewards(loadRewardWallet());
    const params = new URLSearchParams(location.search);
    const id = Number(params.get("battle"));
    const selected = params.get("fighter");
    const challengeSeed = Number(params.get("seed"));
    if ([1, 2, 3, 4].includes(id) && FIGHTERS.some((f) => f.id === selected)) {
      setLevel(id as EpisodeId);
      setSave({ ...local, hero: selected as FighterId });
      setSeed(
        Number.isInteger(challengeSeed) && challengeSeed > 0 && challengeSeed < 2 ** 31
          ? challengeSeed
          : 20260919,
      );
      setChallenge(true);
      setScreen("brief");
    }
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);
  useEffect(() => {
    configureAudio(save.sound, 0.95);
    return installMobileAudioUnlock();
  }, [save.sound]);
  useEffect(() => {
    if (!shareBlob) {
      setShareImage("");
      return;
    }
    const url = URL.createObjectURL(shareBlob);
    setShareImage(url);
    return () => URL.revokeObjectURL(url);
  }, [shareBlob]);
  useEffect(() => {
    if (!dialog) return;
    const previousBody = document.body.style.overflow;
    const previousRoot = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBody;
      document.documentElement.style.overflow = previousRoot;
    };
  }, [dialog]);
  const updateSave = (next: Save) => {
    setSave(next);
    setStored(writeSave(next));
  };
  const hero = fighter(save.hero);
  const completed = Object.keys(save.records).length;
  const play = () => {
    unlockAudio();
    const next = createWorld(save.hero, level, save.difficulty, seed);
    setWorld(next);
    setDialog(null);
    setUsedOwnedSkus([]);
    setScreen("play");
    setWon(false);
    sfx("ui");
  };
  const pause = () => {
    if (world && !world.ended) {
      world.paused = true;
      setDialog((current) => (current === "talk" ? "talk" : "pause"));
    }
  };
  const resume = () => {
    if (world) world.paused = false;
    setDialog(null);
    unlockAudio();
  };
  const openCombatShop = () => {
    if (!world || world.ended) return;
    world.paused = true;
    setDialog("shop");
  };
  const closeDialog = () => {
    if (screen === "play" && world && !world.ended && (dialog === "pause" || dialog === "shop"))
      world.paused = false;
    setDialog(null);
    unlockAudio();
  };
  const claimRewards = (score: number) => {
    if (!world) return;
    setRewards((current) => {
      const result = claimScoreRewards(current, world.level, score);
      if (!result.awarded.length) return current;
      writeRewardWallet(result.wallet);
      notify(`Regalo desbloqueado: ${result.awarded.map((reward) => reward.label).join(" + ")}`);
      return result.wallet;
    });
  };
  const useShopItem = (sku: ShopSku, source: "reward" | "owned") => {
    if (!world) return;
    const result = applyShopPowerup(world, sku);
    if (!result.ok) {
      notify(result.message);
      return;
    }
    if (source === "reward") {
      setRewards((current) => {
        const next = consumeReward(current, sku);
        if (!next) return current;
        writeRewardWallet(next);
        return next;
      });
    } else setUsedOwnedSkus((current) => (current.includes(sku) ? current : [...current, sku]));
    notify(result.message);
    world.paused = false;
    setDialog(null);
  };
  const onEvent = (event: GameEvent) => {
    if (event.type === "toast") notify(event.text);
    if (event.type === "talk") {
      setNpc(event.npc);
      setDialog("talk");
    }
    if (event.type === "win" || event.type === "lose") {
      setWon(event.type === "win");
      setScreen("result");
      setDialog(null);
      if (world && event.type === "win") {
        const medals =
          1 + (world.t < 180 ? 1 : 0) + (world.damageTaken < world.player.maxHp * 0.5 ? 1 : 0);
        updateSave(
          saveResult(save, level, {
            score: Math.round(world.score),
            time: world.t,
            hero: save.hero,
            medals,
          }),
        );
      }
    }
  };
  const result: ShareResult = world
    ? {
        hero: world.hero,
        level: world.level,
        score: world.score,
        time: world.t,
        combo: world.bestCombo,
        seed: world.seed,
        playerName: rankingName || undefined,
      }
    : { hero: save.hero, level, score: 0, time: 0, combo: 0, seed };
  const openShare = async () => {
    setDialog("share");
    setShareBlob(null);
    setShareError("");
    try {
      setShareBlob(await resultCard(result));
    } catch {
      setShareError("No se pudo crear la imagen. El enlace del desafío sigue disponible.");
    }
  };
  const nativeShare = async () => {
    try {
      const url = challengeUrl(result);
      const text = `${fighter(result.hero).name}: ${Math.round(result.score)} puntos en ${episode(result.level).location}. ¿Me superás? Ficción satírica.`;
      const file = shareBlob
        ? new File([shareBlob], "influencers-battle.png", { type: "image/png" })
        : null;
      if (navigator.share) {
        await navigator.share(
          file && navigator.canShare?.({ files: [file] })
            ? { title: "Influencers Battle", text, url, files: [file] }
            : { title: "Influencers Battle", text, url },
        );
      } else if (shareBlob) {
        downloadCard(shareBlob);
        notify("Tarjeta descargada. Copiá también el enlace para desafiar.");
      }
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError"))
        setShareError("No se pudo compartir. Podés descargar la tarjeta y copiar el enlace.");
    }
  };
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(challengeUrl(result));
      notify("Enlace del desafío copiado.");
    } catch {
      setShareError("Copiá el enlace que aparece debajo.");
    }
  };
  const goHome = () => {
    setDialog(null);
    setScreen("home");
    setWorld(null);
  };
  return (
    <main className={`ib-app ${screen === "play" ? "in-game" : ""}`}>
      {intro && <Intro onDone={() => setIntro(false)} />}
      {screen !== "play" && (
        <header className="ib-header">
          <button className="brand" onClick={goHome} aria-label="Influencers Battle, inicio">
            <span className="brand-monogram">
              IB<span>·</span>
            </span>
            <span>
              INFLUENCERS
              <br />
              <b>BATTLE</b>
            </span>
          </button>
          <BrandLogo className="publisher-header" />
          <div className="header-location">
            <i /> Hecho para el quilombo. <span>Paraguay.</span>
          </div>
          <nav>
            <button className="header-shop" onClick={() => setDialog("shop")}>
              <ShoppingBag size={17} /> Tienda
            </button>
            <button className="header-ranking" onClick={() => setDialog("ranking")}>
              <Trophy size={17} /> Ranking
            </button>
            <button className="header-help" onClick={() => setDialog("help")}>
              Cómo jugar
            </button>
            <button
              className="icon-button"
              aria-label="Ajustes"
              onClick={() => setDialog("settings")}
            >
              <Settings2 size={20} />
            </button>
          </nav>
        </header>
      )}

      {screen === "home" && (
        <>
          <section className="home-hero">
            <div className="hero-art">
              <img
                src="/media/characters/cover-v2.webp"
                alt="Los seis personajes de Influencers Battle en una portada de acción paraguaya"
                fetchPriority="high"
              />
              <div className="art-sticker">
                <span>6 EGOS.</span>
                <span>CERO FILTRO.</span>
              </div>
            </div>
            <div className="home-copy">
              <span className="eyebrow">
                <span className="live-dot" /> LA BATALLA POR EL FEED
              </span>
              <h1>
                El feed
                <br />
                es tuyo.
                <br />
                <em>Pelealo.</em>
              </h1>
              <p>
                Del Templo del Último Avivamiento a una Asunción infestada. Elegí tu personaje, armá
                el quilombo y derrotá a cuatro jefes imposibles.
              </p>
              <button
                className="primary play-cta"
                onClick={() => {
                  unlockAudio();
                  setScreen("fighters");
                }}
              >
                <Play fill="currentColor" size={20} /> Entrar a la batalla <ArrowRight size={23} />
              </button>
              <div className="hero-meta">
                <span>
                  <Gamepad2 size={15} /> Móvil & PC
                </span>
                <span>
                  <Swords size={15} /> 4 episodios
                </span>
                <span>
                  <MessageCircle size={15} /> Conversaciones IA
                </span>
              </div>
            </div>
            <div className="hero-footer">
              <span>UNA CAMPAÑA. DEMASIADO DRAMA.</span>
              <span>
                01 — 04 <ArrowRight size={16} />
              </span>
            </div>
          </section>
          <section className="home-roster">
            <div>
              <span className="eyebrow">ELEGÍ TU BANDO</span>
              <h2>Todos tienen algo que decir.</h2>
            </div>
            <div className="roster-strip">
              {FIGHTERS.map((f) => (
                <button
                  key={f.id}
                  className="roster-mini"
                  onClick={() => {
                    updateSave({ ...save, hero: f.id });
                    setScreen("fighters");
                  }}
                  style={statStyle(f.color)}
                >
                  <img src={f.portrait} alt="" />
                  <span>{f.name}</span>
                  <ChevronRight size={15} />
                </button>
              ))}
            </div>
          </section>
          <footer className="ib-footer">
            <BrandLogo className="publisher-footer" />
            <p>{FICTION}</p>
            <nav aria-label="Información de Influencers Battle">
              <a href="/personajes">Personajes</a>
              <a href="/como-jugar">Cómo jugar</a>
              <a href="/privacidad">Privacidad</a>
              <a href="/politica-de-compras">Compras</a>
            </nav>
            <span>18+</span>
          </footer>
        </>
      )}

      {screen === "fighters" && (
        <section className="selection-page">
          <button className="back-link" onClick={() => setScreen("home")}>
            <ArrowLeft size={17} /> Volver
          </button>
          <div className="section-heading">
            <div>
              <span className="eyebrow">01 / ELEGÍ TU PERSONAJE</span>
              <h1>
                ¿Quién arma
                <br />
                el quilombo?
              </h1>
            </div>
            <p>
              Seis estilos. Las mismas ganas
              <br />
              de quedarse con el escenario.
            </p>
          </div>
          <div className="fighter-layout">
            <div className="fighter-grid">
              {FIGHTERS.map((f) => (
                <button
                  key={f.id}
                  className={`fighter-card ${save.hero === f.id ? "selected" : ""}`}
                  style={statStyle(f.color)}
                  onClick={() => {
                    updateSave({ ...save, hero: f.id });
                    sfx("ui");
                  }}
                  aria-pressed={save.hero === f.id}
                >
                  <img src={f.portrait} alt={f.name} />
                  <span className="fighter-index">0{f.row + 1}</span>
                  {save.hero === f.id && (
                    <span className="selected-check">
                      <Check size={17} />
                    </span>
                  )}
                  <div>
                    <small>{f.role}</small>
                    <h2>{f.name}</h2>
                  </div>
                </button>
              ))}
            </div>
            <aside className="fighter-details" style={statStyle(hero.color)}>
              <span className="eyebrow">TU PERSONAJE</span>
              <h2>{hero.name}</h2>
              <blockquote>“{hero.quote}”</blockquote>
              <div className="fighter-stats">
                <div>
                  <Heart size={16} />
                  <span>Resistencia</span>
                  <b>{hero.hp}</b>
                </div>
                <div>
                  <Zap size={16} />
                  <span>Velocidad</span>
                  <div className="stat-bars">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <i
                        key={i}
                        className={i < Math.round((hero.speed - 220) / 17) ? "filled" : ""}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="power-detail">
                <Zap size={24} />
                <div>
                  <small>PODER ESPECIAL</small>
                  <h3>{hero.power}</h3>
                  <p>{hero.powerHint}</p>
                </div>
              </div>
              <div className="super-detail">
                <Flame size={20} />
                <div>
                  <small>SÚPER</small>
                  <strong>{hero.superName}</strong>
                </div>
              </div>
              <button className="primary" onClick={() => setScreen("episodes")}>
                Elegir escenario <ArrowRight size={19} />
              </button>
              <small className="muted">Todos los personajes están disponibles.</small>
            </aside>
          </div>
        </section>
      )}

      {screen === "episodes" && (
        <section className="episodes-page">
          <button className="back-link" onClick={() => setScreen("fighters")}>
            <ArrowLeft size={17} /> Cambiar personaje
          </button>
          <div className="section-heading">
            <div>
              <span className="eyebrow">02 / LA GUERRA POR EL FEED</span>
              <h1>
                Paraguay.
                <br />
                Sin filtro.
              </h1>
            </div>
            <div className="current-fighter">
              <img src={hero.portrait} alt="" />
              <div>
                <small>VAS CON</small>
                <strong>{hero.name}</strong>
                <span>{completed}/4 episodios completados</span>
              </div>
            </div>
          </div>
          <div className="episode-grid">
            {EPISODES.map((e) => (
              <button
                key={e.id}
                className="episode-card"
                onClick={() => {
                  setLevel(e.id);
                  setChallenge(false);
                  setScreen("brief");
                }}
              >
                <img src={e.bg} alt={e.location} />
                <div className="episode-number">0{e.id}</div>
                <div className="episode-copy">
                  <span>
                    <MapPin size={14} />
                    {e.location}
                  </span>
                  <h2>{e.title}</h2>
                  <p>{e.subtitle}</p>
                  <span className="episode-boss">JEFE · {boss(e.id).name}</span>
                  <div className="episode-bottom">
                    <span>
                      {save.records[e.id] ? (
                        <>
                          <Check size={15} /> {save.records[e.id]!.score.toLocaleString("es-PY")}{" "}
                          puntos
                        </>
                      ) : (
                        "Jugar episodio"
                      )}
                      <span className="episode-stars">
                        {save.records[e.id] &&
                          [1, 2, 3].map((n) => (
                            <Star
                              key={n}
                              size={12}
                              fill={n <= save.records[e.id]!.medals ? "currentColor" : "none"}
                            />
                          ))}
                      </span>
                    </span>
                    <ArrowRight size={21} />
                  </div>
                </div>
              </button>
            ))}
          </div>
          <p className="episode-note">
            Podés empezar por cualquier episodio. Jugá en orden para descubrir la historia completa.
          </p>
        </section>
      )}

      {screen === "brief" && (
        <section
          className="brief-page"
          style={{
            backgroundImage: `linear-gradient(90deg, #111018f5 0%, #111018d9 44%, #11101835 100%), url(${episode(level).bg})`,
          }}
        >
          <button className="back-link" onClick={() => setScreen("episodes")}>
            <ArrowLeft size={17} /> Escenarios
          </button>
          <div className="brief-copy">
            <span className="eyebrow">
              {challenge ? "TE DESAFIARON" : "EPISODIO"} / 0{level}
            </span>
            <span className="location-label">
              <MapPin size={16} />
              {episode(level).location}
            </span>
            <h1>{episode(level).title}</h1>
            <p>{episode(level).intro}</p>
            <div className="brief-objectives">
              {episode(level).objectives.map((o, i) => (
                <div key={o}>
                  <span>{i + 1}</span>
                  {o}
                </div>
              ))}
              <div>
                <Swords size={20} />
                Derrotá a {boss(level).name}
              </div>
            </div>
            <button className="primary" onClick={play}>
              <Play size={20} fill="currentColor" /> Jugar con {hero.name} <ArrowRight size={20} />
            </button>
            <small>Podés pausar cuando quieras. La historia no necesita conexión.</small>
          </div>
          <aside className="boss-preview" style={{ color: boss(level).color }}>
            <span>JEFE FINAL</span>
            <img src={boss(level).portrait} alt={boss(level).name} />
            <strong>{boss(level).name}</strong>
            <small>{boss(level).title}</small>
          </aside>
        </section>
      )}

      {screen === "play" && world && (
        <Scene
          world={world}
          settings={save}
          rewardCount={rewardStock(rewards)}
          onEvent={onEvent}
          onPause={pause}
          onOpenShop={openCombatShop}
          onScoreMilestone={claimRewards}
        />
      )}

      {screen === "result" && world && (
        <section className={`result-page ${won ? "won" : ""}`}>
          <div className="result-art" style={{ backgroundImage: `url(${episode(level).bg})` }} />
          <div className="result-main">
            <BrandLogo animated className="result-publisher" />
            <span className="result-symbol">
              {won ? <Trophy size={42} /> : <RotateCcw size={42} />}
            </span>
            <span className="eyebrow">{won ? "EL FEED ES TUYO" : "TODAVÍA HAY REVANCHA"}</span>
            <h1>{won ? `Cayó ${boss(level).name}.` : "Te bajaron del live."}</h1>
            <p>
              {won
                ? episode(level).twist
                : "Leé las señales de ataque, usá el dash y buscá tereré. La próxima puede ser tuya."}
            </p>
            <div className="result-stats">
              <div>
                <small>PUNTOS</small>
                <strong>{Math.round(world.score).toLocaleString("es-PY")}</strong>
              </div>
              <div>
                <small>TIEMPO</small>
                <strong>{formatTime(world.t)}</strong>
              </div>
              <div>
                <small>MEJOR COMBO</small>
                <strong>×{world.bestCombo}</strong>
              </div>
            </div>
            {won && (
              <div className="medal-row">
                <span>
                  <Star fill="currentColor" /> Episodio
                </span>
                <span className={world.t < 180 ? "earned" : ""}>
                  <Star fill={world.t < 180 ? "currentColor" : "none"} /> Menos de 3 min
                </span>
                <span className={world.damageTaken < world.player.maxHp * 0.5 ? "earned" : ""}>
                  <Star
                    fill={world.damageTaken < world.player.maxHp * 0.5 ? "currentColor" : "none"}
                  />{" "}
                  Dominio
                </span>
              </div>
            )}
            <div className="result-actions">
              <button
                className="primary"
                onClick={() =>
                  won && level < 4
                    ? (setLevel((level + 1) as EpisodeId), setScreen("brief"))
                    : play()
                }
              >
                {won && level < 4 ? "Siguiente episodio" : "Revancha"}
                <ArrowRight size={19} />
              </button>
              <button className="secondary" onClick={() => void openShare()}>
                <Share2 size={18} /> Compartir partida
              </button>
              <button className="secondary" onClick={() => setDialog("ranking")}>
                <Trophy size={18} /> Ranking
              </button>
              <button className="text-button" onClick={() => setScreen("episodes")}>
                Elegir otro escenario
              </button>
            </div>
            {!stored && (
              <p className="notice">
                No se pudo guardar en este navegador. Tu resultado sigue disponible para compartir.
              </p>
            )}
          </div>
        </section>
      )}

      {dialog && (
        <div
          className="modal-scrim"
          onClick={(e) => {
            if (e.target === e.currentTarget && dialog !== "talk") {
              closeDialog();
            }
          }}
        >
          {dialog === "talk" && world ? (
            <Talk
              key={`${world.level}-${world.stage}`}
              npc={npc}
              world={world}
              onDone={(choice) => {
                applyChoice(world, choice);
                setDialog(null);
              }}
            />
          ) : (
            <section
              className={`ib-modal ${dialog === "share" ? "share-modal" : ""} ${dialog === "ranking" ? "ranking-modal" : ""} ${dialog === "shop" ? "shop-modal" : ""}`}
              role="dialog"
              aria-modal="true"
              aria-label={
                dialog === "settings"
                  ? "Ajustes"
                  : dialog === "help"
                    ? "Cómo jugar"
                    : dialog === "share"
                      ? "Compartir partida"
                      : dialog === "ranking"
                        ? "Ranking de jugadores"
                        : dialog === "shop"
                          ? "Tienda PY-STAR"
                          : "Pausa"
              }
            >
              <button className="modal-close icon-button" aria-label="Cerrar" onClick={closeDialog}>
                <X size={21} />
              </button>
              {dialog === "pause" && (
                <>
                  <span className="eyebrow">EL QUILOMBO PUEDE ESPERAR</span>
                  <h2>En pausa.</h2>
                  <button className="primary" onClick={resume}>
                    <Play size={18} /> Seguir jugando
                  </button>
                  <button className="secondary" onClick={play}>
                    <RotateCcw size={18} /> Reiniciar episodio
                  </button>
                  <button
                    className="secondary"
                    onClick={() => {
                      if (world) world.paused = true;
                      setScreen("episodes");
                      setDialog(null);
                    }}
                  >
                    <MapPin size={18} /> Elegir escenario
                  </button>
                  <p className="muted">El episodio en curso se reinicia al salir.</p>
                </>
              )}
              {dialog === "settings" && (
                <>
                  <span className="eyebrow">A TU MANERA</span>
                  <h2>Ajustes</h2>
                  <Toggle
                    label="Sonido"
                    value={save.sound}
                    onChange={(v) => {
                      configureAudio(v, 0.95);
                      if (v) {
                        void unlockAudio().then(() => sfx("win"));
                      }
                      updateSave({ ...save, sound: v });
                    }}
                    icon={save.sound ? <Volume2 /> : <VolumeX />}
                  />
                  <button
                    className="secondary"
                    onClick={() => {
                      configureAudio(true, 0.95);
                      void unlockAudio().then(() => sfx("pickup"));
                      if (!save.sound) updateSave({ ...save, sound: true });
                    }}
                  >
                    <Volume2 size={18} /> Probar sonido
                  </button>
                  <Toggle
                    label="Sacudida de cámara"
                    value={save.shake}
                    onChange={(v) => updateSave({ ...save, shake: v })}
                    icon={<Maximize2 />}
                  />
                  <Toggle
                    label="Controles para zurdos"
                    value={save.leftHanded}
                    onChange={(v) => updateSave({ ...save, leftHanded: v })}
                    icon={<Gamepad2 />}
                  />
                  <label className="setting-select">
                    Dificultad
                    <select
                      value={save.difficulty}
                      onChange={(e) =>
                        updateSave({ ...save, difficulty: e.target.value as Save["difficulty"] })
                      }
                    >
                      <option value="tranqui">Tranqui · para disfrutar</option>
                      <option value="picante">Picante · pegá primero</option>
                    </select>
                  </label>
                  <label className="setting-select">
                    Gráficos
                    <select
                      value={save.quality}
                      onChange={(e) =>
                        updateSave({ ...save, quality: e.target.value as Save["quality"] })
                      }
                    >
                      <option value="auto">Automático</option>
                      <option value="low">Liviano · menor resolución</option>
                    </select>
                  </label>
                  <p className="muted">
                    El progreso se guarda en este navegador. Tus ajustes se aplican a la próxima
                    partida.
                  </p>
                </>
              )}
              {dialog === "help" && (
                <>
                  <span className="eyebrow">ENTRÁ Y JUGÁ</span>
                  <h2>
                    Se entiende
                    <br />a los golpes.
                  </h2>
                  <div className="help-list">
                    <div>
                      <Gamepad2 />
                      <p>
                        <strong>Movete y esquivá.</strong> En móvil: joystick izquierdo. A la
                        derecha: salto, ataque, dash y poder. En PC: A/D, espacio, J, Shift y R.
                      </p>
                    </div>
                    <div>
                      <CrosshairIcon />
                      <p>
                        <strong>Elegí tu arma.</strong> Tocá el arma o usá Q. G lanza granadas. Las
                        cajas recargan y el tereré cura.
                      </p>
                    </div>
                    <div>
                      <Zap />
                      <p>
                        <strong>Cargá el hype.</strong> Los golpes cargan tu súper. Al llegar al
                        100%, el botón de poder libera tu ataque especial.
                      </p>
                    </div>
                    <div>
                      <MessageCircle />
                      <p>
                        <strong>Decidí qué decir.</strong> Despejá la zona y activá el objetivo con
                        E o el botón. Elegí una ayuda o conversá con el personaje por IA.
                      </p>
                    </div>
                  </div>
                  <p className="notice">
                    Las señales rojas avisan un ataque. Saltá las ondas bajas y esquivá las cargas.
                    La acción se pausa durante las conversaciones.
                  </p>
                </>
              )}
              {dialog === "share" && (
                <>
                  <span className="eyebrow">MANDÁ EL DESAFÍO</span>
                  <h2>Que hablen.</h2>
                  {shareImage ? (
                    <img
                      className="share-preview"
                      src={shareImage}
                      alt="Tarjeta de resultado de tu partida"
                    />
                  ) : (
                    <p>
                      {shareError ? "La tarjeta no está disponible." : "Preparando tu tarjeta…"}
                    </p>
                  )}
                  <div className="share-actions">
                    <button
                      className="primary"
                      onClick={() => void nativeShare()}
                      disabled={!shareBlob}
                    >
                      <Share2 size={18} /> Compartir
                    </button>
                    <button
                      className="secondary"
                      onClick={() => shareBlob && downloadCard(shareBlob)}
                      disabled={!shareBlob}
                    >
                      <Download size={18} /> Guardar imagen
                    </button>
                    <button className="secondary" onClick={() => void copyLink()}>
                      <Copy size={18} /> Copiar desafío
                    </button>
                  </div>
                  <input
                    className="share-url"
                    readOnly
                    value={typeof window !== "undefined" ? challengeUrl(result) : ""}
                    aria-label="Enlace del desafío"
                    onFocus={(e) => e.target.select()}
                  />
                  <p className="muted">
                    El enlace usa la dirección actual. Para abrirlo desde otro teléfono, el juego
                    debe estar publicado en una dirección accesible.
                  </p>
                  {shareError && <p className="notice">{shareError}</p>}
                </>
              )}
              {dialog === "ranking" && (
                <Leaderboard
                  result={result}
                  canSubmit={Boolean(won && world)}
                  onRegistered={(name) => {
                    setRankingName(name);
                    notify(`${name} ya está en el ranking.`);
                  }}
                />
              )}
              {dialog === "shop" && (
                <ShopPanel
                  inBattle={screen === "play" && Boolean(world)}
                  rewards={rewards}
                  ownedSkus={ownedSkus}
                  usedOwnedSkus={usedOwnedSkus}
                  onUse={useShopItem}
                  onBenefitsSynced={setOwnedSkus}
                />
              )}
            </section>
          )}
        </div>
      )}
      {toast && (
        <div className="ib-toast" role="status">
          {toast}
        </div>
      )}
    </main>
  );
}
function CrosshairIcon() {
  return <Swords />;
}
function Toggle({
  label,
  value,
  onChange,
  icon,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      className="setting-toggle"
      onClick={() => onChange(!value)}
      role="switch"
      aria-checked={value}
    >
      <span>
        {icon}
        {label}
      </span>
      <i className={value ? "on" : ""}>
        <b />
      </i>
    </button>
  );
}
function Talk({
  npc,
  world,
  onDone,
}: {
  npc: FighterId;
  world: World;
  onDone: (choice: number) => void;
}) {
  const f = fighter(npc),
    e = episode(world.level);
  const [history, setHistory] = useState<AgentTurn[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [count, setCount] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const alive = useRef(true);
  const log = useRef<HTMLDivElement>(null);
  useEffect(
    () => () => {
      alive.current = false;
    },
    [],
  );
  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight, behavior: "smooth" });
  }, [history, busy]);
  const send = async () => {
    const message = draft.trim();
    if (!message || busy || count >= 8) return;
    setDraft("");
    setError("");
    setBusy(true);
    setCount((c) => c + 1);
    setHistory((h) => [...h, { role: "user", text: message }]);
    try {
      const reply = await chatWithNpc({
        data: {
          who: npc,
          player: fighter(world.hero).name,
          history: history.slice(-8),
          message,
          context: `Episodio ${world.level}, ${e.location}. Objetivos recuperados: ${world.stage}/2. Personaje jugador: ${fighter(world.hero).name}. Conversación de tregua antes del próximo combate.`,
        },
      });
      if (!alive.current) return;
      if (reply.ok) setHistory((h) => [...h, { role: "assistant", text: reply.text }]);
      else setError(reply.text);
    } catch {
      if (alive.current)
        setError("No se pudo conectar. Las opciones del guion siguen disponibles.");
    } finally {
      if (alive.current) setBusy(false);
    }
  };
  return (
    <section
      className="talk-modal"
      role="dialog"
      aria-modal="true"
      aria-label={`Conversación con ${f.name}`}
      style={statStyle(f.color)}
    >
      <div className="talk-portrait">
        <img src={f.portrait} alt={f.name} />
        <div>
          <span className="eyebrow">TREGUA EN EL FEED</span>
          <h2>{f.name}</h2>
          <p>{f.role}</p>
        </div>
      </div>
      <div className="talk-content">
        <div className="talk-header">
          <span>
            <MessageCircle size={17} /> Conversación · Ficción satírica
          </span>
          <button
            className="icon-button"
            aria-label="Seguir sin conversar"
            onClick={() => onDone(2)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="talk-log" ref={log}>
          <p className="script-bubble">
            <small>GUION</small>
            {chosen === null ? e.taunt : e.replies[chosen]}
          </p>
          {history.map((turn, i) => (
            <p key={i} className={`chat-bubble ${turn.role}`}>
              <small>{turn.role === "user" ? "VOS" : `${f.name} · IA`}</small>
              {turn.text}
            </p>
          ))}
          {busy && <p className="muted">La IA está respondiendo… Podés seguir jugando.</p>}
          {error && (
            <p className="notice" role="status">
              {error}
            </p>
          )}
        </div>
        <div className="dialogue-choices">
          {chosen === null ? (
            e.choices.map((choice, i) => (
              <button key={choice} onClick={() => setChosen(i)}>
                <span>
                  {i === 0 ? (
                    <Shield size={17} />
                  ) : i === 1 ? (
                    <Zap size={17} />
                  ) : (
                    <Heart size={17} />
                  )}
                </span>
                {choice}
                <ChevronRight size={17} />
              </button>
            ))
          ) : (
            <button className="primary" onClick={() => onDone(chosen)}>
              Volver a la batalla <ArrowRight size={18} />
            </button>
          )}
        </div>
        <form
          onSubmit={(ev) => {
            ev.preventDefault();
            void send();
          }}
          className="chat-form"
        >
          <input
            value={draft}
            maxLength={400}
            onChange={(ev) => setDraft(ev.target.value)}
            placeholder={
              count >= 8 ? "Seguí la historia para otra charla" : `Decile algo a ${f.name}…`
            }
            aria-label="Mensaje al personaje"
            disabled={busy || count >= 8}
          />
          <button
            type="submit"
            aria-label="Enviar a la IA"
            disabled={busy || !draft.trim() || count >= 8}
          >
            <ArrowRight size={21} />
          </button>
        </form>
        <small className="chat-note">
          IA con Venice · opcional · {count}/8 mensajes en esta charla
        </small>
      </div>
    </section>
  );
}
