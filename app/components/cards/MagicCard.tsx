/* eslint-disable @next/next/no-img-element */
"use client";

import { ScryfallCard } from "@/app/api/assistants/mtg/types";
import { Coins, ExternalLink, Shield } from "lucide-react";
import { ManaCost } from "./ManaCost";

/**
 * Style constants for MagicCard component
 */
const STYLES = {
  container: "flex flex-col md:flex-row gap-6",
  borderAccent: "border-l-4 pl-4 -ml-2 mb-4",

  // Image styles
  imageWrapper: "flex-shrink-0",
  cardImage:
    "rounded-lg shadow-xl max-w-[280px] w-full object-contain hover:scale-[1.02] transition-transform duration-300 border border-white/10",
  placeholderImage:
    "w-[280px] h-[390px] bg-stone-800/50 rounded-lg flex items-center justify-center text-stone-500 border border-white/10",

  // Details section
  detailsContainer: "flex-1 flex flex-col gap-4 min-w-0",
  headerContainer: "flex gap-3",
  artworkImage:
    "w-20 h-20 rounded-lg object-cover border border-white/20 shadow-md",
  artworkWrapper: "flex-shrink-0",

  // Title section
  titleSection: "flex-1 min-w-0",
  titleWrapper: "flex flex-wrap items-start justify-between gap-2 mb-2",
  cardName: "text-2xl font-bold text-foreground",
  manaCostBadge:
    "bg-primary/10 px-3 py-1.5 rounded-md border border-primary/20",
  typeLine: "text-sm text-muted-foreground font-medium",

  // Oracle text
  oracleContainer: "bg-muted/30 p-4 rounded-lg border border-border/50",
  oracleText: "whitespace-pre-wrap leading-relaxed text-foreground/90 text-sm",
  flavorText:
    "mt-3 pt-3 italic text-xs text-muted-foreground border-t border-border/30",

  // Stats grid
  statsGrid: "grid grid-cols-2 sm:grid-cols-3 gap-3",
  statItem:
    "flex items-center gap-2 bg-muted/20 px-3 py-2 rounded-md border border-border/30",
  statItemWide:
    "flex items-center gap-2 bg-muted/20 px-3 py-2 rounded-md border border-border/30 col-span-2 sm:col-span-1",
  statIcon: "size-4 text-primary",
  statText: "font-bold text-sm",
  rarityDot: "size-2 rounded-full",
  rarityText: "capitalize text-sm",
  setName: "text-xs text-muted-foreground truncate",

  // Footer
  footer: "flex flex-wrap items-center gap-3 pt-2 border-t border-border/30",
  priceUsd:
    "flex items-center gap-1.5 text-green-400 bg-green-950/20 px-2.5 py-1 rounded-md text-xs border border-green-900/30",
  priceEur:
    "flex items-center gap-1.5 text-blue-400 bg-blue-950/20 px-2.5 py-1 rounded-md text-xs border border-blue-900/30",
  priceIcon: "size-3.5",
  priceValue: "font-medium",
  scryfallLink:
    "ml-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors group",
  externalIcon:
    "size-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform",
} as const;

/**
 * Color accent classes based on MTG color identity
 */
const COLOR_ACCENTS = {
  colorless: "border-l-stone-400",
  multicolor: "border-l-yellow-500",
  W: "border-l-yellow-200",
  U: "border-l-blue-400",
  B: "border-l-purple-600",
  R: "border-l-red-500",
  G: "border-l-green-500",
} as const;

/**
 * Rarity indicator colors
 */
const RARITY_COLORS = {
  mythic: "bg-orange-500",
  rare: "bg-yellow-500",
  uncommon: "bg-gray-400",
  common: "bg-stone-500",
} as const;

interface MagicCardProps {
  card: ScryfallCard;
}

export function MagicCard({ card }: MagicCardProps) {
  const getAccentColor = () => {
    if (!card.colors || card.colors.length === 0)
      return COLOR_ACCENTS.colorless;
    if (card.colors.length > 1) return COLOR_ACCENTS.multicolor;

    const color = card.colors[0] as keyof typeof COLOR_ACCENTS;
    return COLOR_ACCENTS[color] || COLOR_ACCENTS.colorless;
  };

  const getRarityColor = () => {
    return (
      RARITY_COLORS[card.rarity as keyof typeof RARITY_COLORS] ||
      RARITY_COLORS.common
    );
  };

  const imageUrl =
    card.image_uris?.normal || card.image_uris?.large || card.image_uris?.png;
  const artCropUrl = card.image_uris?.art_crop;

  return (
    <div className={`${STYLES.borderAccent} ${getAccentColor()}`}>
      <div className={STYLES.container}>
        {/* Imagen de la carta */}
        <div className={STYLES.imageWrapper}>
          {imageUrl ? (
            <img src={imageUrl} alt={card.name} className={STYLES.cardImage} />
          ) : (
            <div className={STYLES.placeholderImage}>Sin imagen</div>
          )}
        </div>

        {/* Detalles de la carta */}
        <div className={STYLES.detailsContainer}>
          {/* Header con arte */}
          <div className={STYLES.headerContainer}>
            {artCropUrl && (
              <div className={STYLES.artworkWrapper}>
                <img
                  src={artCropUrl}
                  alt={`${card.name} artwork`}
                  className={STYLES.artworkImage}
                />
              </div>
            )}
            <div className={STYLES.titleSection}>
              <div className={STYLES.titleWrapper}>
                <h3 className={STYLES.cardName}>{card.name}</h3>
                {card.mana_cost && (
                  <div className={STYLES.manaCostBadge}>
                    <ManaCost manaCost={card.mana_cost} size={18} />
                  </div>
                )}
              </div>
              <p className={STYLES.typeLine}>{card.type_line}</p>
            </div>
          </div>

          {/* Oracle Text */}
          <div className={STYLES.oracleContainer}>
            <p className={STYLES.oracleText}>
              {card.oracle_text || "Sin texto de oráculo"}
            </p>
            {card.flavor_text && (
              <p className={STYLES.flavorText}>
                <em>&quot;{card.flavor_text}&quot;</em>
              </p>
            )}
          </div>

          {/* Stats Grid */}
          <div className={STYLES.statsGrid}>
            {card.power && card.toughness && (
              <div className={STYLES.statItem}>
                <Shield className={STYLES.statIcon} />
                <span className={STYLES.statText}>
                  {card.power}/{card.toughness}
                </span>
              </div>
            )}

            <div className={STYLES.statItem}>
              <div className={`${STYLES.rarityDot} ${getRarityColor()}`} />
              <span className={STYLES.rarityText}>{card.rarity}</span>
            </div>

            {card.set_name && (
              <div className={STYLES.statItemWide}>
                <span className={STYLES.setName}>{card.set_name}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={STYLES.footer}>
            {card.prices?.usd && (
              <div className={STYLES.priceUsd}>
                <Coins className={STYLES.priceIcon} />
                <span className={STYLES.priceValue}>${card.prices.usd}</span>
              </div>
            )}
            {card.prices?.eur && (
              <div className={STYLES.priceEur}>
                <Coins className={STYLES.priceIcon} />
                <span className={STYLES.priceValue}>€{card.prices.eur}</span>
              </div>
            )}

            <a
              href={card.scryfall_uri}
              target="_blank"
              rel="noopener noreferrer"
              className={STYLES.scryfallLink}
            >
              <span>Ver en Scryfall</span>
              <ExternalLink className={STYLES.externalIcon} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
