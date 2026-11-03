import React, { useEffect, useRef } from 'react';

/**
 * WaterRipple (Realistic Hydrodynamic Wave Engine)
 * 1. Draws multi-ring water wave caustics and circular ripples on an HTML5 Canvas at 60fps.
 * 2. Wave Propagation & Buoyancy: When water waves expand and collide with floating cards (.water-buoyant),
 *    the cards gently bob and tilt like real floating objects on water!
 */
export default function WaterRipple() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    let animId = null;
    let ripples = [];
    let lastX = -100;
    let lastY = -100;
    let lastSpawnTime = 0;

    // High-DPR crisp canvas scaling
    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const startAnimation = () => {
      if (!animId) {
        animId = requestAnimationFrame(render);
      }
    };

    // Spawn realistic multi-ring water ripples
    const spawnWave = (x, y, isClick = false) => {
      const baseSpeed = isClick ? 3.2 : 2.2;
      const maxR = isClick ? 130 : 75;
      const baseAlpha = isClick ? 0.85 : 0.55;

      // Primary crest ring
      ripples.push({
        x,
        y,
        radius: 2,
        maxRadius: maxR,
        speed: baseSpeed,
        baseAlpha: baseAlpha,
        colorPrimary: '34, 211, 238', // bright aqua
        colorSecondary: '8, 126, 164', // sea blue
        isClick,
        hitCards: new Set(),
      });

      // Secondary trailing echo wave (creates authentic concentric water wave pattern)
      ripples.push({
        x,
        y,
        radius: -10, // slight delay
        maxRadius: maxR * 0.8,
        speed: baseSpeed * 0.9,
        baseAlpha: baseAlpha * 0.7,
        colorPrimary: '56, 239, 245',
        colorSecondary: '6, 59, 92',
        isClick,
        hitCards: new Set(),
      });

      // Cap concurrent ripples for 60fps performance
      if (ripples.length > 20) {
        ripples = ripples.slice(ripples.length - 16);
      }

      startAnimation();
    };

    const handlePointerMove = (e) => {
      const now = performance.now();
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Create wave whenever pointer moves more than 16px or after 80ms
      if (dist > 16 || (now - lastSpawnTime > 80 && dist > 6)) {
        lastX = e.clientX;
        lastY = e.clientY;
        lastSpawnTime = now;
        spawnWave(e.clientX, e.clientY, false);
      }
    };

    const handlePointerDown = (e) => {
      lastX = e.clientX;
      lastY = e.clientY;
      spawnWave(e.clientX, e.clientY, true);
    };

    // Helper to trigger realistic water bobbing on nearby floating cards
    const triggerCardBobbing = (card, fromLeft) => {
      if (card.dataset.isBobbing === 'true') return;
      card.dataset.isBobbing = 'true';

      // Soft water displacement: lift 4-6px and slight realistic buoyant tilt 1.2deg
      const tilt = fromLeft ? '1deg' : '-1deg';
      card.style.transition = 'transform 0.35s cubic-bezier(0.2, 0.8, 0.3, 1.2), box-shadow 0.35s ease';
      card.style.transform = `translateY(-6px) rotate(${tilt})`;
      card.style.boxShadow = '0 16px 40px rgba(8, 126, 164, 0.22), 0 0 16px rgba(34, 211, 238, 0.3)';

      // Settle back like a buoy floating on calm water
      setTimeout(() => {
        card.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.5s ease';
        card.style.transform = 'translateY(0) rotate(0deg)';
        card.style.boxShadow = '';
        setTimeout(() => {
          card.dataset.isBobbing = 'false';
        }, 300);
      }, 350);
    };

    const render = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);

      // Query all cards that float on water
      const buoyantElements = document.querySelectorAll('.water-buoyant');

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.speed;

        // Skip if still in negative delay
        if (r.radius <= 0) continue;

        const progress = r.radius / r.maxRadius;
        if (progress >= 1) {
          ripples.splice(i, 1);
          continue;
        }

        const currentAlpha = r.baseAlpha * Math.pow(1 - progress, 1.4);
        const lineWidth = Math.max(1.2, (1 - progress) * (r.isClick ? 3.5 : 2.5));

        // 1. Draw outer soft water caustics glow
        ctx.save();
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r.colorSecondary}, ${currentAlpha * 0.4})`;
        ctx.lineWidth = lineWidth * 1.8;
        ctx.shadowColor = `rgba(${r.colorPrimary}, ${currentAlpha * 0.9})`;
        ctx.shadowBlur = 10;
        ctx.stroke();

        // 2. Draw sharp bright wave crest ring
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r.colorPrimary}, ${currentAlpha})`;
        ctx.lineWidth = lineWidth;
        ctx.stroke();

        // 3. Subtle translucent water lens fill
        if (r.isClick && progress < 0.5) {
          ctx.fillStyle = `rgba(34, 211, 238, ${currentAlpha * 0.08})`;
          ctx.fill();
        }
        ctx.restore();

        // 4. Physical Collision with Floating Cards:
        // When wave reaches the bounding box of a card, make the card gently bob on the water!
        if (buoyantElements.length > 0 && progress < 0.85) {
          buoyantElements.forEach((card) => {
            if (r.hitCards.has(card)) return;

            const rect = card.getBoundingClientRect();
            // Check if card is visible on screen
            if (rect.bottom < 0 || rect.top > height) return;

            const cardCenterX = rect.left + rect.width / 2;
            const cardCenterY = rect.top + rect.height / 2;

            const dx = cardCenterX - r.x;
            const dy = cardCenterY - r.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Wave hits card when wave radius intersects card radius
            const cardRadius = Math.min(rect.width, rect.height) * 0.45;
            if (Math.abs(dist - r.radius) < 25) {
              r.hitCards.add(card);
              triggerCardBobbing(card, r.x < cardCenterX);
            }
          });
        }
      }

      if (ripples.length > 0) {
        animId = requestAnimationFrame(render);
      } else {
        animId = null;
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 99,
      }}
      aria-hidden="true"
    />
  );
}
