/* eslint-disable @next/next/no-img-element */
"use client";

interface ManaSymbolProps {
  symbol: string;
  size?: number;
}

export function ManaSymbol({ symbol, size = 20 }: ManaSymbolProps) {
  // Remover las llaves {} del símbolo
  const cleanSymbol = symbol.replace(/[{}]/g, "");

  // Verificar si es un símbolo híbrido (contiene /)
  const isHybrid = cleanSymbol.includes("/");

  if (isHybrid) {
    const [left, right] = cleanSymbol.split("/");
    return <HybridManaSymbol left={left} right={right} size={size} />;
  }

  // Verificar si es un número (mana genérico)
  const isGeneric = /^\d+$/.test(cleanSymbol);

  // Si es mana genérico, mostrar el número en un círculo gris
  if (isGeneric) {
    return (
      <div
        className="inline-flex items-center justify-center rounded-full bg-gray-400 text-black font-bold"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          fontSize: `${size * 0.6}px`,
        }}
      >
        {cleanSymbol}
      </div>
    );
  }

  // Mapa de colores a archivos SVG
  const colorMap: Record<string, string> = {
    W: "/icons/colors/W.svg",
    U: "/icons/colors/U.svg",
    B: "/icons/colors/B.svg",
    R: "/icons/colors/R.svg",
    G: "/icons/colors/G.svg",
    C: "/icons/colors/C.svg",
  };

  const svgPath = colorMap[cleanSymbol.toUpperCase()];

  // Si no encontramos el símbolo, mostrar texto
  if (!svgPath) {
    return (
      <span className="inline-flex items-center justify-center text-xs font-mono">
        {symbol}
      </span>
    );
  }

  return (
    <img
      src={svgPath}
      alt={cleanSymbol}
      width={size}
      height={size}
      className="inline-block"
    />
  );
}

interface HybridManaSymbolProps {
  left: string;
  right: string;
  size: number;
}

function HybridManaSymbol({ left, right, size }: HybridManaSymbolProps) {
  const colorMap: Record<string, string> = {
    W: "/icons/colors/W.svg",
    U: "/icons/colors/U.svg",
    B: "/icons/colors/B.svg",
    R: "/icons/colors/R.svg",
    G: "/icons/colors/G.svg",
    C: "/icons/colors/C.svg",
  };

  const leftSvg = colorMap[left.toUpperCase()];
  const rightSvg = colorMap[right.toUpperCase()];

  // Si alguno no se encuentra, mostrar texto
  if (!leftSvg || !rightSvg) {
    return (
      <span className="inline-flex items-center justify-center text-xs font-mono">
        {left}/{right}
      </span>
    );
  }

  return (
    <div
      className="inline-block relative"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {/* Mitad izquierda */}
      <img
        src={leftSvg}
        alt={left}
        width={size}
        height={size}
        className="absolute top-0 left-0"
        style={{
          clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)",
        }}
      />

      {/* Mitad derecha */}
      <img
        src={rightSvg}
        alt={right}
        width={size}
        height={size}
        className="absolute top-0 left-0"
        style={{
          clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)",
        }}
      />
    </div>
  );
}

interface ManaCostProps {
  manaCost: string;
  size?: number;
}

export function ManaCost({ manaCost, size = 20 }: ManaCostProps) {
  // Parsear el mana cost: "{2}{U}{B}" -> ["2", "U", "B"]
  const symbols = manaCost.match(/\{[^}]+\}/g) || [];

  if (symbols.length === 0) {
    return <span className="text-sm text-muted-foreground">{manaCost}</span>;
  }

  return (
    <div className="inline-flex items-center gap-0.5">
      {symbols.map((symbol, index) => (
        <ManaSymbol key={index} symbol={symbol} size={size} />
      ))}
    </div>
  );
}
