import { useEffect, useRef, useState } from 'react';

export function Interactive3DBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
      }
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.03;
      currentY += (targetY - currentY) * 0.03;
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

  // Particle system
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      size: number;
      color: string;
    }> = [];

    // Create particles
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 1000,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        vz: Math.random() * 0.5 + 0.1,
        size: Math.random() * 2 + 1,
        color: Math.random() > 0.5 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(59, 130, 246, 0.8)',
      });
    }

    const focalLength = 500;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const animateParticles = () => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const mouseX = (mousePosition.x / 100) * canvas.width;
      const mouseY = (mousePosition.y / 100) * canvas.height;

      particles.forEach((particle) => {
        // Mouse influence
        const dx = mouseX - particle.x;
        const dy = mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const force = Math.min(100 / distance, 0.1);
        
        particle.vx += (dx / distance) * force * 0.01;
        particle.vy += (dy / distance) * force * 0.01;

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.z += particle.vz;

        // Reset if out of bounds
        if (particle.z > 1000) {
          particle.z = 0;
          particle.x = Math.random() * canvas.width;
          particle.y = Math.random() * canvas.height;
        }

        // 3D projection
        const scale = focalLength / (focalLength + particle.z);
        const x2d = centerX + (particle.x - centerX) * scale;
        const y2d = centerY + (particle.y - centerY) * scale;

        // Draw particle
        ctx.beginPath();
        ctx.arc(x2d, y2d, particle.size * scale, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = scale;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Draw connections
        particles.forEach((other) => {
          if (other === particle) return;
          const dx2 = other.x - particle.x;
          const dy2 = other.y - particle.y;
          const dz2 = other.z - particle.z;
          const dist = Math.sqrt(dx2 * dx2 + dy2 * dy2 + dz2 * dz2);

          if (dist < 150) {
            const scale2 = focalLength / (focalLength + other.z);
            const x2d2 = centerX + (other.x - centerX) * scale2;
            const y2d2 = centerY + (other.y - centerY) * scale2;

            ctx.beginPath();
            ctx.moveTo(x2d, y2d);
            ctx.lineTo(x2d2, y2d2);
            ctx.strokeStyle = `rgba(16, 185, 129, ${(1 - dist / 150) * 0.2})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animateParticles);
    };

    animateParticles();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mousePosition]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
    >
      {/* Canvas particle system */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ opacity: 0.6 }}
      />

      {/* Large cinematic gradient orbs */}
      <div
        className="absolute rounded-full blur-[120px] opacity-30"
        style={{
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.6) 0%, rgba(59, 130, 246, 0.4) 50%, transparent 70%)',
          left: `${mousePosition.x * 0.5}%`,
          top: `${mousePosition.y * 0.5}%`,
          transform: `translate(-50%, -50%) translateZ(${(mousePosition.x - 50) * 10}px) rotateX(${(mousePosition.y - 50) * 0.2}deg) rotateY(${(mousePosition.x - 50) * 0.2}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.05s linear',
          filter: 'blur(120px)',
        }}
      />
      
      <div
        className="absolute rounded-full blur-[100px] opacity-25"
        style={{
          width: '700px',
          height: '700px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.5) 0%, rgba(16, 185, 129, 0.3) 50%, transparent 70%)',
          right: `${(100 - mousePosition.x) * 0.4}%`,
          bottom: `${(100 - mousePosition.y) * 0.4}%`,
          transform: `translate(50%, 50%) translateZ(${(100 - mousePosition.x) * 8}px) rotateX(${(100 - mousePosition.y) * -0.2}deg) rotateY(${(100 - mousePosition.x) * -0.2}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.05s linear',
          filter: 'blur(100px)',
        }}
      />

      {/* Floating light orbs */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 300;
        const baseX = 50 + Math.cos(angle + Date.now() * 0.0001) * (radius / window.innerWidth * 100);
        const baseY = 50 + Math.sin(angle + Date.now() * 0.0001) * (radius / window.innerHeight * 100);
        
        return (
          <div
            key={i}
            className="absolute rounded-full blur-2xl opacity-20"
            style={{
              width: `${200 + Math.sin(Date.now() * 0.001 + i) * 50}px`,
              height: `${200 + Math.sin(Date.now() * 0.001 + i) * 50}px`,
              background: `radial-gradient(circle, rgba(${i % 2 === 0 ? '16, 185, 129' : '59, 130, 246'}, 0.4) 0%, transparent 70%)`,
              left: `${baseX + (mousePosition.x - 50) * 0.1}%`,
              top: `${baseY + (mousePosition.y - 50) * 0.1}%`,
              transform: `translate(-50%, -50%) translateZ(${Math.sin(Date.now() * 0.0005 + i) * 100}px)`,
              transformStyle: 'preserve-3d',
              animation: `pulse${i} ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        );
      })}

      {/* Animated 3D grid with depth */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          transform: `translateZ(-300px) rotateX(${(mousePosition.y - 50) * 0.2}deg) rotateY(${(mousePosition.x - 50) * 0.2}deg) rotateZ(${(mousePosition.x - 50) * 0.1}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.05s linear',
          perspective: '2000px',
        }}
      />

      {/* Secondary grid layer */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.25) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.25) 1px, transparent 1px)
          `,
          backgroundSize: '120px 120px',
          transform: `translateZ(-200px) rotateX(${(mousePosition.y - 50) * -0.15}deg) rotateY(${(mousePosition.x - 50) * -0.15}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.05s linear',
        }}
      />

      {/* Light rays effect */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `conic-gradient(from ${mousePosition.x * 3.6}deg at ${mousePosition.x}% ${mousePosition.y}%, transparent 0deg, rgba(16, 185, 129, 0.1) 45deg, transparent 90deg, rgba(59, 130, 246, 0.1) 135deg, transparent 180deg)`,
          transform: `rotateZ(${(mousePosition.x - 50) * 0.1}deg)`,
          transition: 'transform 0.1s ease-out',
        }}
      />

      {/* CSS animations */}
      <style>{`
        @keyframes pulse0 {
          0%, 100% { opacity: 0.15; transform: translate(-50%, -50%) translateZ(0px) scale(1); }
          50% { opacity: 0.3; transform: translate(-50%, -50%) translateZ(50px) scale(1.2); }
        }
        @keyframes pulse1 {
          0%, 100% { opacity: 0.2; transform: translate(-50%, -50%) translateZ(0px) scale(1); }
          50% { opacity: 0.35; transform: translate(-50%, -50%) translateZ(-50px) scale(1.15); }
        }
        @keyframes pulse2 {
          0%, 100% { opacity: 0.18; transform: translate(-50%, -50%) translateZ(0px) scale(1); }
          50% { opacity: 0.32; transform: translate(-50%, -50%) translateZ(40px) scale(1.25); }
        }
        @keyframes pulse3 {
          0%, 100% { opacity: 0.22; transform: translate(-50%, -50%) translateZ(0px) scale(1); }
          50% { opacity: 0.38; transform: translate(-50%, -50%) translateZ(-40px) scale(1.18); }
        }
        @keyframes pulse4 {
          0%, 100% { opacity: 0.16; transform: translate(-50%, -50%) translateZ(0px) scale(1); }
          50% { opacity: 0.28; transform: translate(-50%, -50%) translateZ(60px) scale(1.22); }
        }
        @keyframes pulse5 {
          0%, 100% { opacity: 0.19; transform: translate(-50%, -50%) translateZ(0px) scale(1); }
          50% { opacity: 0.33; transform: translate(-50%, -50%) translateZ(-60px) scale(1.16); }
        }
        @keyframes pulse6 {
          0%, 100% { opacity: 0.17; transform: translate(-50%, -50%) translateZ(0px) scale(1); }
          50% { opacity: 0.3; transform: translate(-50%, -50%) translateZ(45px) scale(1.2); }
        }
        @keyframes pulse7 {
          0%, 100% { opacity: 0.21; transform: translate(-50%, -50%) translateZ(0px) scale(1); }
          50% { opacity: 0.36; transform: translate(-50%, -50%) translateZ(-45px) scale(1.19); }
        }
      `}</style>
    </div>
  );
}
