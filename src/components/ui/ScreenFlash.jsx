export default function ScreenFlash({ color }) {
  if (!color) return null;
  return (
    <div style={{position:"fixed",inset:0,background:color,zIndex:600,pointerEvents:"none",animation:"flashFade 0.35s ease forwards"}}/>
  );
}
