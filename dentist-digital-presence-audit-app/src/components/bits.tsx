"use client";

import { type ReactNode, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type HTMLMotionProps,
} from "framer-motion";
import {
  Asterisk,
  AtSign,
  Check,
  Clapperboard,
  Globe,
  MapPin,
  MessageCircle,
  Star,
} from "lucide-react";

/* ---------------- Logo ---------------- */

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        className={`grid size-10 place-items-center rounded-xl border-2 shadow-hard-sm ${
          dark ? "border-mint/70 bg-deep" : "border-ink bg-pine"
        }`}
      >
        <svg viewBox="0 0 24 24" className="size-6" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="8.6" stroke="#7ff3d2" strokeWidth="1.3" opacity="0.45" />
          <circle cx="12" cy="12" r="4.8" stroke="#7ff3d2" strokeWidth="1.3" opacity="0.7" />
          <path d="M12 12 18.6 5.4" stroke="#7ff3d2" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="12" cy="12" r="1.5" fill="#7ff3d2" />
          <circle cx="16.8" cy="15.8" r="1.15" fill="#7ff3d2" />
        </svg>
      </span>
      <span className="leading-none">
        <span className="block font-display text-lg tracking-tight">
          <span className={`font-black ${dark ? "text-bone" : "text-ink"}`}>
            MAPSO
          </span>
          <span className={`font-medium ${dark ? "text-mint/85" : "text-ink"}`}>
            .RADAR
          </span>
        </span>
        <span
          className={`mt-0.5 block text-[10px] font-semibold ${
            dark ? "text-mint/80" : "text-brand"
          }`}
        >
          رادار عيادات الأسنان
        </span>
      </span>
    </span>
  );
}

export function Noise() {
  return <div className="grain" aria-hidden />;
}

/* ---------------- Marquee ---------------- */

export function Marquee({
  items,
  className = "",
}: {
  items: string[];
  className?: string;
}) {
  const row = [...items, ...items, ...items, ...items];
  return (
    <div dir="ltr" className={`overflow-hidden ${className}`}>
      <div className="flex w-max animate-marquee items-center">
        {row.map((t, i) => (
          <span
            key={i}
            className="flex items-center gap-3 px-5 whitespace-nowrap"
            dir="rtl"
          >
            <span className="text-sm font-bold">{t}</span>
            <Asterisk className="size-4 opacity-70" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Animated number ---------------- */

export function AnimatedNumber({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => String(Math.round(v)));

  useEffect(() => {
    const controls = animate(mv, value, {
      type: "spring",
      stiffness: 60,
      damping: 18,
    });
    return () => controls.stop();
  }, [value, mv]);

  return (
    <motion.span className={`tabular-nums ${className}`}>{rounded}</motion.span>
  );
}

/* ---------------- Score gauge ---------------- */

export function ScoreGauge({
  value,
  size = 220,
  stroke = 15,
  color = "#0c7c64",
  track = "rgba(14,31,29,0.1)",
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const mv = useMotionValue(0);
  const dash = useTransform(
    mv,
    (v) => c - (Math.min(100, Math.max(0, v)) / 100) * c,
  );

  useEffect(() => {
    const controls = animate(mv, value, {
      type: "spring",
      stiffness: 50,
      damping: 15,
      delay: 0.15,
    });
    return () => controls.stop();
  }, [value, mv]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={track}
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          style={{ strokeDashoffset: dash }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        {children}
      </div>
    </div>
  );
}

/* ---------------- Meter bar ---------------- */

export function Meter({
  pct,
  color = "#0c7c64",
  className = "",
  delay = 0,
}: {
  pct: number;
  color?: string;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={`h-2.5 w-full overflow-hidden rounded-full bg-ink/10 ${className}`}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: "0%" }}
        whileInView={{ width: `${Math.max(2, pct)}%` }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ type: "spring", stiffness: 55, damping: 18, delay }}
      />
    </div>
  );
}

/* ---------------- Switch ---------------- */

export function Switch({
  checked,
  onChange,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  id?: string;
}) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`relative h-7 w-12 shrink-0 rounded-full border-2 border-ink transition-colors duration-200 ${
        checked ? "bg-brand" : "bg-paper"
      } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand`}
    >
      <span
        className={`absolute top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded-full transition-all duration-200 ${
          checked
            ? "start-[calc(100%-1.45rem)] bg-white"
            : "start-[0.15rem] bg-ink/70"
        }`}
      >
        {checked && <Check className="size-3.5 text-brand" strokeWidth={3.5} />}
      </span>
    </button>
  );
}

/* ---------------- Category icon ---------------- */

const CAT_ICONS: Record<string, typeof AtSign> = {
  instagram: AtSign,
  video: Clapperboard,
  "map-pin": MapPin,
  globe: Globe,
  star: Star,
  "message-circle": MessageCircle,
};

export function CategoryIcon({
  icon,
  className = "size-5",
}: {
  icon: string;
  className?: string;
}) {
  const Cmp = CAT_ICONS[icon] ?? Star;
  return <Cmp className={className} />;
}

/* ---------------- Reveal ---------------- */

export function Reveal({
  children,
  delay = 0,
  y = 22,
  className = "",
  ...rest
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
} & Omit<HTMLMotionProps<"div">, "children">) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "spring", stiffness: 70, damping: 16, delay }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- Priority chip ---------------- */

export function PriorityChip({ p }: { p: "high" | "medium" | "low" }) {
  const map = {
    high: { t: "أولوية عالية", c: "bg-coral/15 text-coral border-coral/40" },
    medium: { t: "أولوية متوسطة", c: "bg-gold/15 text-gold border-gold/40" },
    low: { t: "تحسين", c: "bg-ink/8 text-ink-soft border-ink/20" },
  } as const;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${map[p].c}`}
    >
      {map[p].t}
    </span>
  );
}
