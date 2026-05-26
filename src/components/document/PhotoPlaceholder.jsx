// SVG parametrized silhouette — features: { hair: 'short'|'long'|'bald', glasses: bool, beard: bool }
const HAIR_COLOR = '#3a2010';

function FaceSVG({ features: f, mismatch }) {
  return (
    <svg viewBox="0 0 52 64" width="52" height="60" style={{ display: 'block' }}>
      {/* Background */}
      <rect width="52" height="64" fill={mismatch ? '#fff4e0' : '#f0ece0'} />

      {/* Shoulders / body */}
      <ellipse cx="26" cy="68" rx="22" ry="12" fill="#8899aa" />

      {/* Neck */}
      <rect x="21" y="50" width="10" height="9" fill="#d4a882" rx="2" />

      {/* Long hair (behind head) */}
      {f.hair === 'long' && (
        <>
          <rect x="10" y="24" width="5" height="26" fill={HAIR_COLOR} rx="3" />
          <rect x="37" y="24" width="5" height="26" fill={HAIR_COLOR} rx="3" />
        </>
      )}

      {/* Head */}
      <ellipse cx="26" cy="36" rx="15" ry="17" fill="#d4a882" />

      {/* Hair on top */}
      {f.hair !== 'bald' && (
        <ellipse cx="26" cy="21" rx="15" ry="9" fill={HAIR_COLOR} />
      )}

      {/* Eyes */}
      <ellipse cx="20" cy="36" rx="2.4" ry="2.2" fill="#3a2010" />
      <ellipse cx="32" cy="36" rx="2.4" ry="2.2" fill="#3a2010" />

      {/* Nose */}
      <path d="M 25 39 L 24 44 L 28 44" fill="none" stroke="#c09070" strokeWidth="0.8" />

      {/* Mouth */}
      <path d="M 21 49 Q 26 52 31 49" fill="none" stroke="#aa6050" strokeWidth="1.2" strokeLinecap="round" />

      {/* Glasses */}
      {f.glasses && (
        <g stroke="#222" strokeWidth="1.3" fill="none">
          <rect x="15" y="33" width="10" height="7" rx="2.5" />
          <rect x="27" y="33" width="10" height="7" rx="2.5" />
          <line x1="25" y1="36.5" x2="27" y2="36.5" />
          <line x1="15" y1="36.5" x2="12" y2="35.5" />
          <line x1="37" y1="36.5" x2="40" y2="35.5" />
        </g>
      )}

      {/* Beard */}
      {f.beard && (
        <ellipse cx="26" cy="50" rx="9" ry="5" fill={HAIR_COLOR} opacity="0.75" />
      )}

      {/* Mismatch warning badge */}
      {mismatch && (
        <g>
          <circle cx="44" cy="9" r="7" fill="#cc6600" />
          <text x="44" y="13" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">!</text>
        </g>
      )}
    </svg>
  );
}

export default function PhotoPlaceholder({ features, mismatch = false, label = '3×4' }) {
  const f = features || { hair: 'short', glasses: false, beard: false };
  return (
    <div style={{
      width: 52, height: 72, border: `1px solid ${mismatch ? '#cc6600' : '#c0aa88'}`,
      background: mismatch ? '#fff4e0' : '#f0ece0',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'flex-start', flexShrink: 0, borderRadius: 1,
      position: 'relative', overflow: 'hidden',
    }}>
      <FaceSVG features={f} mismatch={mismatch} />
      <div style={{
        fontSize: 7, color: mismatch ? '#cc6600' : '#999',
        textAlign: 'center', lineHeight: 1.2, paddingBottom: 2,
        fontFamily: 'monospace',
      }}>
        {mismatch ? 'SUSPEITA' : label}
      </div>
    </div>
  );
}
