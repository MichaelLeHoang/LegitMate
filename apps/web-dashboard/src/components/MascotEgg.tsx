import React from 'react';

interface MascotEggProps {
  rating: 'GOOD' | 'CAREFUL' | 'CRACKED' | 'ROTTEN' | 'LOADING' | 'UNKNOWN';
  size?: number;
  className?: string;
  expression?: 'normal' | 'happy' | 'suspicious' | 'shocked' | 'dizzy' | 'searching';
}

export default function MascotEgg({ rating, size = 120, className = '', expression }: MascotEggProps) {
  // Determine active expression if not explicitly forced
  const activeRating = rating;
  
  // Custom theme-based colors
  // Deerstalker hat color: friendly brown/caramel
  // Egg shell color: gentle warm cream/white
  // Detective coat: match brand orange or cute matching tones
  
  return (
    <div 
      className={`relative flex items-center justify-center select-none overflow-visible ${className}`}
      style={{ width: size, height: size + 10 }}
    >
      <svg
        viewBox="0 0 200 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md transition-all duration-300 overflow-visible"
      >
        {/* Glow Effects behind the Egg Detective based on state */}
        {activeRating === 'GOOD' && (
          <circle cx="100" cy="120" r="70" fill="#4CAF50" fillOpacity="0.12" className="animate-pulse" />
        )}
        {activeRating === 'CAREFUL' && (
          <circle cx="100" cy="120" r="70" fill="#FFD166" fillOpacity="0.15" />
        )}
        {(activeRating === 'CRACKED' || activeRating === 'ROTTEN') && (
          <circle cx="100" cy="120" r="70" fill="#EF4444" fillOpacity="0.12" className="animate-pulse" />
        )}
        {activeRating === 'LOADING' && (
          <circle cx="100" cy="120" r="72" stroke="#FF9F1C" strokeWidth="4" strokeDasharray="12 6" className="animate-[spin_12s_linear_infinite]" />
        )}

        {/* --- SHADOW --- */}
        <ellipse cx="100" cy="195" rx="55" ry="10" fill="#2D2A26" fillOpacity="0.1" />

        {/* --- EGG SHELL BODY --- */}
        {/* Cute teardrop path representing an upright egg */}
        <path
          d="M100 45C50 45 42 110 42 150C42 178 68 190 100 190C132 190 158 178 158 150C158 110 150 45 100 45Z"
          fill={activeRating === 'ROTTEN' ? '#EAE5D9' : '#FFFFFF'}
          stroke="#2D2A26"
          strokeWidth="6"
          strokeLinejoin="round"
        />

        {/* Rotten spots for rotten egg */}
        {activeRating === 'ROTTEN' && (
          <g>
            <circle cx="65" cy="130" r="12" fill="#CCD5AE" stroke="#2D2A26" strokeWidth="4" />
            <circle cx="132" cy="165" r="9" fill="#CCD5AE" stroke="#2D2A26" strokeWidth="3" />
            <path d="M 50 162 Q 54 165 58 162" stroke="#2D2A26" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}

        {/* Cracked Egg Lines */}
        {(activeRating === 'CRACKED' || activeRating === 'ROTTEN') && (
          <path
            d="M 125 75 L 110 90 L 122 102 L 105 118 L 118 128"
            stroke="#2D2A26"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        )}
        {activeRating === 'ROTTEN' && (
          <path
            d="M 68 85 L 58 98 L 70 106 L 56 120"
            stroke="#2D2A26"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        )}

        {/* --- DETECTIVE HAT (Deerstalker) --- */}
        {/* Hat shadow/crown - widened and lowered to perfectly cup the egg's upper dome */}
        <path
          d="M 38 86 C 40 28, 160 28, 162 86 Z"
          fill="#D68227"
          stroke="#2D2A26"
          strokeWidth="5.5"
          strokeLinejoin="round"
        />
        {/* Hat Brim - adjusted to match the secure snug fit */}
        <path
          d="M 26 85 C 60 79, 140 79, 174 85 C 178 85, 178 91, 170 91 C 130 93, 70 93, 30 91 C 22 91, 22 85, 26 85 Z"
          fill="#F5A342"
          stroke="#2D2A26"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
        {/* Hat Earflap ribbon/bow on top - adjusted slightly for the snug crown */}
        <circle cx="100" cy="30" r="10" fill="#E86A17" stroke="#2D2A26" strokeWidth="4.5" />
        <path d="M 94 30 Q 100 34 106 30" stroke="#2D2A26" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path
          d="M 65 79 C 65 79, 100 82, 135 79"
          stroke="#2D2A26"
          strokeWidth="4"
          strokeDasharray="6 4"
        />

        {/* --- FACE DETAILS --- */}
        {/* EYES */}
        {activeRating === 'LOADING' && (
          <g>
            {/* Spinning/searching spiral glasses or loading cute circles */}
            <circle cx="75" cy="120" r="16" fill="none" stroke="#2D2A26" strokeWidth="5.5" />
            <circle cx="125" cy="120" r="16" fill="none" stroke="#2D2A26" strokeWidth="5.5" />
            {/* Swirl lines */}
            <path d="M75 110 A 10 10 0 1 1 68 126" stroke="#2D2A26" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M125 110 A 10 10 0 1 1 118 126" stroke="#2D2A26" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* Bridge */}
            <path d="M 91 120 L 109 120" stroke="#2D2A26" strokeWidth="5" />
          </g>
        )}

        {activeRating === 'GOOD' && (
          <g>
            {/* Happy anime arch eyes */}
            <path d="M 62 122 Q 74 110 82 122" stroke="#2D2A26" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M 118 122 Q 126 110 138 122" stroke="#2D2A26" strokeWidth="6" strokeLinecap="round" fill="none" />
            {/* Cheeks */}
            <ellipse cx="58" cy="132" rx="7" ry="5" fill="#FF9F1C" fillOpacity="0.6" />
            <ellipse cx="142" cy="132" rx="7" ry="5" fill="#FF9F1C" fillOpacity="0.6" />
          </g>
        )}

        {activeRating === 'CAREFUL' && (
          <g>
            {/* Left normal cute eye */}
            <circle cx="74" cy="124" r="9" fill="#2D2A26" />
            <circle cx="72" cy="121" r="3" fill="#FFFFFF" />
            
            {/* Right eye - larger looking through magnifying glass / smart eyebrow */}
            <circle cx="123" cy="121" r="11" fill="#2D2A26" />
            <circle cx="120" cy="118" r="4" fill="#FFFFFF" />
            
            {/* Concentrated mouth */}
            <path d="M 94 142 Q 100 138 106 142" stroke="#2D2A26" strokeWidth="5.5" strokeLinecap="round" fill="none" />
          </g>
        )}

        {activeRating === 'CRACKED' && (
          <g>
            {/* Worried eyes */}
            <path d="M 64 125 C 68 118, 80 118, 84 125" stroke="#2D2A26" strokeWidth="5.5" strokeLinecap="round" fill="none" />
            <path d="M 116 125 C 120 118, 132 118, 136 125" stroke="#2D2A26" strokeWidth="5.5" strokeLinecap="round" fill="none" />
            {/* Sweat bead */}
            <path d="M 144 105 Q 148 110 144 115 q -6 -1 -3 -10" fill="#72C7FC" stroke="#2D2A26" strokeWidth="2.5" />
          </g>
        )}

        {activeRating === 'ROTTEN' && (
          <g>
            {/* Crossed-out eyes x_x */}
            <path d="M 64 116 L 76 128" stroke="#2D2A26" strokeWidth="5.5" strokeLinecap="round" />
            <path d="M 76 116 L 64 128" stroke="#2D2A26" strokeWidth="5.5" strokeLinecap="round" />
            
            <path d="M 124 116 L 136 128" stroke="#2D2A26" strokeWidth="5.5" strokeLinecap="round" />
            <path d="M 136 116 L 124 128" stroke="#2D2A26" strokeWidth="5.5" strokeLinecap="round" />
          </g>
        )}

        {activeRating === 'UNKNOWN' && (
          <g>
            {/* Quizical eyes */}
            <path d="M 62 120 Q 72 113 80 120" stroke="#2D2A26" strokeWidth="5.5" strokeLinecap="round" fill="none" />
            <circle cx="125" cy="122" r="8" fill="#2D2A26" />
            {/* Question Mark floating near top-right */}
            <path d="M 148 55 C 146 51, 154 44, 160 48 Q 162 50, 159 55 Q 156 58, 156 61" stroke="#E86A17" strokeWidth="4" fill="none" strokeLinecap="round" />
            <circle cx="156" cy="68" r="3" fill="#E86A17" />
          </g>
        )}

        {/* --- MOUTH CONNECTIONS FOR THE OTHERS --- */}
        {activeRating === 'GOOD' && (
          <path d="M 88 141 Q 100 155 112 141" stroke="#2D2A26" strokeWidth="5.5" strokeLinecap="round" fill="#E86A17" />
        )}
        {activeRating === 'CRACKED' && (
          <path d="M 90 148 Q 100 138 110 148" stroke="#2D2A26" strokeWidth="5" strokeLinecap="round" fill="none" />
        )}
        {activeRating === 'ROTTEN' && (
          <path d="M 86 148 Q 100 158 114 148" stroke="#2D2A26" strokeWidth="5" strokeLinecap="round" fill="none" />
        )}
        {activeRating === 'UNKNOWN' && (
          <path d="M 92 143 Q 100 148 108 143" stroke="#2D2A26" strokeWidth="5" strokeLinecap="round" fill="none" />
        )}
        {activeRating === 'LOADING' && (
          <ellipse cx="100" cy="144" rx="8" ry="5" fill="#2D2A26" />
        )}

        {/* --- MAGNIFYING GLASS HAND --- */}
        {/* Render a tiny detective magnifying glass held by a glove */}
        {activeRating !== 'ROTTEN' && (
          <g className={activeRating === 'LOADING' ? 'animate-pulse' : ''}>
            {/* Magnifying Glass Handle */}
            <path d="M 125 155 L 140 185" stroke="#2D2A26" strokeWidth="8" strokeLinecap="round" />
            <path d="M 125 155 L 140 185" stroke="#E86A17" strokeWidth="4" strokeLinecap="round" />
            
            {/* Magnifying Glass Lens Frame */}
            <circle cx="118" cy="142" r="18" fill="#FFF8E7" fillOpacity="0.4" stroke="#2D2A26" strokeWidth="5.5" />
            {/* Highlight */}
            <path d="M 108 135 A 12 12 0 0 1 126 135" stroke="#FFFFFF" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            
            {/* Hand Glove holding the glass */}
            <circle cx="132" cy="165" r="8" fill="#F5A342" stroke="#2D2A26" strokeWidth="4.5" />
          </g>
        )}

        {/* Left tiny detective glove */}
        <circle cx="56" cy="162" r="7" fill="#F5A342" stroke="#2D2A26" strokeWidth="4" />

        {/* --- CUTE DETECTIVE TRENCH COAT COLLAR --- */}
        <path d="M 64 184 L 80 176 L 100 190 L 120 176 L 136 184" stroke="#2D2A26" strokeWidth="5.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Tiny golden/orange badge */}
        <polygon points="100,174 105,182 100,190 95,182" fill="#FFD166" stroke="#2D2A26" strokeWidth="3" />
      </svg>
    </div>
  );
}
