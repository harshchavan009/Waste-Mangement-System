import React, { useEffect, useRef } from 'react';

export default function EcoParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let particles = [];
    const particleCount = 70;

    // Mouse coordinates tracker for interactive parallax push
    const mouse = { x: null, y: null, radius: 110 };

    const handleMouseMove = (event) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = canvas.parentElement.offsetWidth || window.innerWidth;
      canvas.height = canvas.parentElement.offsetHeight || window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    // Initial sizing
    handleResize();

    // Helper to draw an organic leaf on Canvas
    const drawLeaf = (ctx, x, y, size, rotation, opacity) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.beginPath();
      
      // Left side curve of leaf
      ctx.moveTo(0, -size);
      ctx.quadraticCurveTo(-size * 0.7, -size * 0.1, 0, size);
      
      // Right side curve of leaf
      ctx.quadraticCurveTo(size * 0.7, -size * 0.1, 0, -size);
      
      // Center vein
      ctx.moveTo(0, -size);
      ctx.lineTo(0, size);

      ctx.fillStyle = `rgba(52, 211, 153, ${opacity * 0.45})`; // Emerald
      ctx.strokeStyle = `rgba(16, 185, 129, ${opacity * 0.6})`;
      ctx.lineWidth = 1;
      
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };

    // Helper to draw a glowing Recycling Symbol on Canvas
    const drawRecycleSymbol = (ctx, x, y, size, rotation, opacity) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      // Font sizing scales dynamically with particle size
      ctx.font = `${size * 2.2}px sans-serif`;
      
      // Green neon glow drop shadow
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#34d399';
      
      ctx.fillStyle = `rgba(52, 211, 153, ${opacity * 0.75})`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      ctx.fillText('♻', 0, 0);
      ctx.restore();
    };

    class Particle {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = Math.random() * canvas.width;
        this.y = init ? Math.random() * canvas.height : canvas.height + 20;
        this.size = Math.random() * 6 + 2.5;
        this.speedX = (Math.random() - 0.5) * 0.35;
        this.speedY = -(Math.random() * 0.45 + 0.15); // floating upward
        
        // Dynamic Particle categories distribution:
        // - 'ai-dot' (Green AI particles)
        // - 'eco-leaf' (Eco leaf animations)
        // - 'recycle-icon' (Glowing ♻ recycling icons)
        // - 'bokeh' (Cyan backdrop highlights)
        const rand = Math.random();
        if (rand < 0.28) {
          this.type = 'ai-dot';
        } else if (rand < 0.56) {
          this.type = 'eco-leaf';
        } else if (rand < 0.78) {
          this.type = 'recycle-icon';
        } else {
          this.type = 'bokeh';
        }

        this.opacity = Math.random() * 0.6 + 0.15;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.015;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 25) + 10;
      }

      update() {
        // Gently bob sideways
        this.x += this.speedX + Math.sin(this.y * 0.01) * 0.1;
        this.y += this.speedY;

        // Leaf and Recycling symbols rot
        if (this.type === 'eco-leaf' || this.type === 'recycle-icon') {
          this.rotation += this.rotSpeed;
        }

        // Interactive mouse parallax push
        if (mouse.x !== null && mouse.y !== null) {
          const rect = canvas.getBoundingClientRect();
          const canvasMouseX = mouse.x - rect.left;
          const canvasMouseY = mouse.y - rect.top;

          const dx = canvasMouseX - this.x;
          const dy = canvasMouseY - this.y;
          const distance = Math.hypot(dx, dy);

          if (distance < mouse.radius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouse.radius - distance) / mouse.radius;
            
            // Push away
            this.x -= forceDirectionX * force * 3;
            this.y -= forceDirectionY * force * 3;
          }
        }

        // Recycle particle to bottom if it floats out of bounds
        if (this.y < -30 || this.x < -30 || this.x > canvas.width + 30) {
          this.reset(false);
        }
      }

      draw() {
        if (this.type === 'ai-dot') {
          // Emissive Green AI nodes
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size * 0.65, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(16, 185, 129, ${this.opacity})`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#10b981';
          ctx.fill();
          ctx.shadowBlur = 0; // reset
        } else if (this.type === 'eco-leaf') {
          // Volumetric floating leaf shape
          drawLeaf(ctx, this.x, this.y, this.size * 1.5, this.rotation, this.opacity);
        } else if (this.type === 'recycle-icon') {
          // Glowing ♻ recycling icon particles
          drawRecycleSymbol(ctx, this.x, this.y, this.size * 1.3, this.rotation, this.opacity);
        } else {
          // Soft cyan floating data bokeh
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size * 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(6, 182, 212, ${this.opacity * 0.25})`;
          ctx.fill();
        }
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    // Draw active AI network lines connecting nodes together
    const drawNetworkLinks = () => {
      for (let a = 0; a < particles.length; a++) {
        if (particles[a].type !== 'ai-dot') continue;
        for (let b = a; b < particles.length; b++) {
          if (particles[b].type !== 'ai-dot') continue;
          
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = Math.hypot(dx, dy);

          if (distance < 95) {
            const opacity = (1 - (distance / 95)) * 0.15 * Math.min(particles[a].opacity, particles[b].opacity);
            ctx.strokeStyle = `rgba(16, 185, 129, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw each particle
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      // Draw standard networking links
      drawNetworkLinks();

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
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-85 dark:opacity-65" 
    />
  );
}
