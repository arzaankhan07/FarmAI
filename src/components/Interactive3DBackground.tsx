import { useEffect, useRef, useState } from 'react';

export function Interactive3DBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    let animationFrame: number;
    let targetX = 50;
    let targetY = 50;
    let currentX = 50;
    let currentY = 50;

    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        targetX = ((e.clientX - rect.left) / rect.width) * 100;
        targetY = ((e.clientY - rect.top) / rect.height) * 100;
        setIsMoving(true);
      }
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;
      
      if (Math.abs(targetX - currentX) < 0.1 && Math.abs(targetY - currentY) < 0.1) {
        setIsMoving(false);
      }
      
      setMousePosition({ x: currentX, y: currentY });
      animationFrame = requestAnimationFrame(animate);
    };

    animate();
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      style={{
        perspective: '1000px',
      }}
    >
      {/* Animated gradient orbs with 3D effect */}
      <div
        className="absolute rounded-full blur-3xl opacity-25"
        style={{
          width: '700px',
          height: '700px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.5) 0%, rgba(59, 130, 246, 0.3) 50%, transparent 70%)',
          left: `${mousePosition.x * 0.4}%`,
          top: `${mousePosition.y * 0.4}%`,
          transform: `translate(-50%, -50%) translateZ(${mousePosition.x * 2 - 100}px) rotateX(${mousePosition.y * 0.1}deg) rotateY(${mousePosition.x * 0.1}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease-out',
        }}
      />
      
      <div
        className="absolute rounded-full blur-3xl opacity-20"
        style={{
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(16, 185, 129, 0.3) 50%, transparent 70%)',
          right: `${(100 - mousePosition.x) * 0.3}%`,
          bottom: `${(100 - mousePosition.y) * 0.3}%`,
          transform: `translate(50%, 50%) translateZ(${(100 - mousePosition.x) * 2 - 100}px) rotateX(${(100 - mousePosition.y) * 0.1}deg) rotateY(${(100 - mousePosition.x) * 0.1}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease-out',
        }}
      />

      {/* Additional smaller orb */}
      <div
        className="absolute rounded-full blur-2xl opacity-15"
        style={{
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(139, 92, 246, 0.2) 50%, transparent 70%)',
          left: `${50 + (mousePosition.x - 50) * 0.2}%`,
          top: `${50 + (mousePosition.y - 50) * 0.2}%`,
          transform: `translate(-50%, -50%) translateZ(${(mousePosition.x - 50) * 3}px) rotateZ(${mousePosition.x * 0.5}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease-out',
        }}
      />

      {/* 3D floating particles with mouse interaction */}
      {Array.from({ length: 25 }).map((_, i) => {
        const size = Math.random() * 5 + 2;
        const initialX = Math.random() * 100;
        const initialY = Math.random() * 100;
        const duration = Math.random() * 20 + 15;
        const delay = Math.random() * 5;
        const zDepth = Math.random() * 300 - 150;
        const mouseInfluence = (mousePosition.x - 50) * 0.1 + (mousePosition.y - 50) * 0.1;

        return (
          <div
            key={i}
            className="absolute rounded-full opacity-40"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              background: `rgba(${Math.random() > 0.5 ? '16, 185, 129' : '59, 130, 246'}, ${0.5 + Math.random() * 0.3})`,
              left: `${initialX + (mousePosition.x - 50) * 0.05}%`,
              top: `${initialY + (mousePosition.y - 50) * 0.05}%`,
              transform: `translate(-50%, -50%) translateZ(${zDepth + mouseInfluence}px) scale(${1 + (zDepth + mouseInfluence) / 200})`,
              transformStyle: 'preserve-3d',
              animation: `float${i} ${duration}s ease-in-out infinite`,
              animationDelay: `${delay}s`,
              filter: 'blur(0.5px)',
              boxShadow: `0 0 ${size * 3}px rgba(${Math.random() > 0.5 ? '16, 185, 129' : '59, 130, 246'}, 0.6)`,
              transition: 'transform 0.1s ease-out',
            }}
          />
        );
      })}

      {/* Animated 3D grid lines */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          transform: `translateZ(-200px) rotateX(${(mousePosition.y - 50) * 0.15}deg) rotateY(${(mousePosition.x - 50) * 0.15}deg) rotateZ(${(mousePosition.x - 50) * 0.05}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease-out',
          perspective: '1000px',
        }}
      />

      {/* Secondary grid layer */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
          transform: `translateZ(-150px) rotateX(${(mousePosition.y - 50) * -0.1}deg) rotateY(${(mousePosition.x - 50) * -0.1}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease-out',
        }}
      />

      {/* Animated grid lines */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: `translateZ(-100px) rotateX(${mousePosition.y * 0.1 - 5}deg) rotateY(${mousePosition.x * 0.1 - 5}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.3s ease-out',
        }}
      />

      {/* Add CSS animations */}
      <style>{`
        @keyframes float0 {
          0%, 100% { transform: translate(-50%, -50%) translateZ(0px) rotate(0deg); }
          50% { transform: translate(-50%, -50%) translateZ(50px) rotate(180deg); }
        }
        @keyframes float1 {
          0%, 100% { transform: translate(-50%, -50%) translateZ(0px) rotate(0deg); }
          50% { transform: translate(-50%, -50%) translateZ(-50px) rotate(-180deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(-50%, -50%) translateZ(0px) rotate(0deg); }
          50% { transform: translate(-50%, -50%) translateZ(30px) rotate(90deg); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(-50%, -50%) translateZ(0px) rotate(0deg); }
          50% { transform: translate(-50%, -50%) translateZ(-30px) rotate(-90deg); }
        }
        @keyframes float4 {
          0%, 100% { transform: translate(-50%, -50%) translateZ(0px) rotate(0deg); }
          50% { transform: translate(-50%, -50%) translateZ(40px) rotate(120deg); }
        }
        @keyframes float5 {
          0%, 100% { transform: translate(-50%, -50%) translateZ(0px) rotate(0deg); }
          50% { transform: translate(-50%, -50%) translateZ(-40px) rotate(-120deg); }
        }
        @keyframes float6 {
          0%, 100% { transform: translate(-50%, -50%) translateZ(0px) rotate(0deg); }
          50% { transform: translate(-50%, -50%) translateZ(25px) rotate(60deg); }
        }
        @keyframes float7 {
          0%, 100% { transform: translate(-50%, -50%) translateZ(0px) rotate(0deg); }
          50% { transform: translate(-50%, -50%) translateZ(-25px) rotate(-60deg); }
        }
        @keyframes float8 {
          0%, 100% { transform: translate(-50%, -50%) translateZ(0px) rotate(0deg); }
          50% { transform: translate(-50%, -50%) translateZ(35px) rotate(150deg); }
        }
        @keyframes float9 {
          0%, 100% { transform: translate(-50%, -50%) translateZ(0px) rotate(0deg); }
          50% { transform: translate(-50%, -50%) translateZ(-35px) rotate(-150deg); }
        }
        @keyframes float10 {
          0%, 100% { transform: translate(-50%, -50%) translateZ(0px) rotate(0deg); }
          50% { transform: translate(-50%, -50%) translateZ(45px) rotate(200deg); }
        }
        @keyframes float11 {
          0%, 100% { transform: translate(-50%, -50%) translateZ(0px) rotate(0deg); }
          50% { transform: translate(-50%, -50%) translateZ(-45px) rotate(-200deg); }
        }
        @keyframes float12 {
          0%, 100% { transform: translate(-50%, -50%) translateZ(0px) rotate(0deg); }
          50% { transform: translate(-50%, -50%) translateZ(20px) rotate(75deg); }
        }
        @keyframes float13 {
          0%, 100% { transform: translate(-50%, -50%) translateZ(0px) rotate(0deg); }
          50% { transform: translate(-50%, -50%) translateZ(-20px) rotate(-75deg); }
        }
        @keyframes float14 {
          0%, 100% { transform: translate(-50%, -50%) translateZ(0px) rotate(0deg); }
          50% { transform: translate(-50%, -50%) translateZ(55px) rotate(250deg); }
        }
        @keyframes float15 {
          0%, 100% { transform: translate(-50%, -50%) translateZ(0px) rotate(0deg); }
          50% { transform: translate(-50%, -50%) translateZ(-55px) rotate(-250deg); }
        }
        @keyframes float16 {
          0%, 100% { transform: translate(-50%, -50%) translateZ(0px) rotate(0deg); }
          50% { transform: translate(-50%, -50%) translateZ(15px) rotate(30deg); }
        }
        @keyframes float17 {
          0%, 100% { transform: translate(-50%, -50%) translateZ(0px) rotate(0deg); }
          50% { transform: translate(-50%, -50%) translateZ(-15px) rotate(-30deg); }
        }
        @keyframes float18 {
          0%, 100% { transform: translate(-50%, -50%) translateZ(0px) rotate(0deg); }
          50% { transform: translate(-50%, -50%) translateZ(60px) rotate(300deg); }
        }
        @keyframes float19 {
          0%, 100% { transform: translate(-50%, -50%) translateZ(0px) rotate(0deg); }
          50% { transform: translate(-50%, -50%) translateZ(-60px) rotate(-300deg); }
        }
      `}</style>
    </div>
  );
}

