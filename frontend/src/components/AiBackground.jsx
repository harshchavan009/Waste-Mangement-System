import React, { useEffect, useRef } from 'react';

export default function AiBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let particles = [];
    const maxParticles = 85;

    // Track mouse for interactive node connections
    const mouse = {
      x: null,
      y: null,
      radius: 150 // Distance within which mouse interacts with nodes
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    // Set initial size
    handleResize();

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1; // Small node size
        
        // Speed velocities
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        
        // Node color: 70% Emerald, 30% Electric Blue
        const isBlue = Math.random() < 0.3;
        this.color = isBlue ? '59, 130, 246' : '16, 185, 129';
        this.opacity = Math.random() * 0.6 + 0.2;
        
        // Pulse rate for high-tech telemetry effect
        this.pulse = Math.random() * 0.05;
        this.pulseDirection = 1;
      }

      update() {
        // Move particles
        this.x += this.vx;
        this.y += this.vy;

        // Pulse opacity for dynamic feeling
        this.opacity += 0.005 * this.pulseDirection;
        if (this.opacity > 0.8 || this.opacity < 0.2) {
          this.pulseDirection *= -1;
        }

        // Screen boundary collisions (wrap around with safety margin)
        if (this.x < -10) this.x = canvas.width + 10;
        if (this.x > canvas.width + 10) this.x = -10;
        if (this.y < -10) this.y = canvas.height + 10;
        if (this.y > canvas.height + 10) this.y = -10;

        // Interactive mouse gravity pull (slight pull towards cursor)
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.hypot(dx, dy);
          if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            // Move gently towards mouse
            this.x += (dx / distance) * force * 0.6;
            this.y += (dy / distance) * force * 0.6;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
        
        // Dynamic node halos
        if (this.size > 2) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = `rgba(${this.color}, 0.5)`;
        }
        
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < maxParticles; i++) {
        particles.push(new Particle());
      }
    };

    const drawConnections = () => {
      // Connect nodes to each other
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.hypot(dx, dy);

          if (distance < 130) {
            // Stronger opacity for closer nodes
            const baseOpacity = 1 - (distance / 130);
            const opacity = baseOpacity * 0.18 * Math.min(particles[i].opacity, particles[j].opacity);
            
            // Choose line color (blend green and blue)
            const color = particles[i].color === '59, 130, 246' ? '59, 130, 246' : '16, 185, 129';
            
            ctx.strokeStyle = `rgba(${color}, ${opacity})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }

        // Connect nodes to mouse if present
        if (mouse.x !== null && mouse.y !== null) {
          const dx = particles[i].x - mouse.x;
          const dy = particles[i].y - mouse.y;
          const distance = Math.hypot(dx, dy);

          if (distance < mouse.radius) {
            const opacity = (1 - (distance / mouse.radius)) * 0.25;
            ctx.strokeStyle = `rgba(16, 185, 129, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      drawConnections();
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {/* Digital Grid Layer */}
      <div className="absolute inset-0 digital-grid opacity-[0.25] dark:opacity-[0.15]" />
      
      {/* Dynamic particles and connections */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full opacity-80 dark:opacity-60"
      />
      
      {/* Extra digital scanline aesthetic overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.007] to-transparent pointer-events-none" />
    </div>
  );
}
