
interface TV2LogoProps {
  className?: string;
}

export default function TV2Logo({ className = "w-5 h-5" }: TV2LogoProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 21 26" 
      fill="none"
      className={`${className} object-contain`}
    >
      <path 
        d="M10.1297 0C16.0747 0 20.2595 4.26615 20.2595 10.4134V12.9664HER_LIMER_DU_INN_RESTEN_AV_STRINGEN26H20.2927V20.9948H6.27711L13.4842 13H7.20706L0 20.9948V26Z" 
        fill="currentColor"
      />
    </svg>
  );
}