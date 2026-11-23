/** Design tokens. hoverOnlyWhenSupported = hover styles never fire on touch (Emil: gate hover). */
module.exports={
  content:['./app/**/*.{js,jsx}','./components/**/*.{js,jsx}'],
  future:{hoverOnlyWhenSupported:true},
  theme:{extend:{
    colors:{bg:'#0a0a0a',surface:'#121212',line:'#2a2a2a',accent:'#f7d000',live:'#ff3b30',win:'#00d26a',muted:'#8d8d8d'},
    fontFamily:{display:['var(--font-display)','Arial Narrow','sans-serif'],sans:['var(--font-body)','system-ui','sans-serif']},
    transitionTimingFunction:{out:'cubic-bezier(0.23, 1, 0.32, 1)'},
    keyframes:{shim:{from:{backgroundPosition:'200% 0'},to:{backgroundPosition:'-200% 0'}}},
    animation:{shim:'shim 1.6s linear infinite'}
  }},plugins:[]}
