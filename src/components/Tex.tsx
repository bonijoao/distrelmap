import katex from "katex";
import { useMemo } from "react";

export function Tex({ tex, display = false, className }: { tex: string; display?: boolean; className?: string }) {
  const html = useMemo(
    () => katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: false }),
    [tex, display],
  );
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
