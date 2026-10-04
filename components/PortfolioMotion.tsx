'use client';

import type {RefObject} from 'react';
import {useEffect} from 'react';
import {animate, createScope, stagger, utils} from 'animejs';

type PortfolioMotionProps = {
  rootRef: RefObject<HTMLDivElement | null>;
  contentKey: string;
};

/**
 * Motion layer for the legacy portfolio markup.
 *
 * Only opacity and transforms are animated. Those properties stay on the
 * compositor in modern browsers and avoid the layout/repaint cost of animating
 * top, left, width or height.
 */
export default function PortfolioMotion({rootRef, contentKey}: PortfolioMotionProps) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const animatedOnScroll = new WeakSet<Element>();
    const observedOnScroll = new WeakSet<Element>();
    const interactiveElements = new WeakSet<Element>();
    const listenerCleanups: Array<() => void> = [];
    let intersectionObserver: IntersectionObserver | undefined;
    let mutationObserver: MutationObserver | undefined;

    const scope = createScope({
      root,
      mediaQueries: {
        isMobile: '(max-width: 767px)',
        reduceMotion: '(prefers-reduced-motion: reduce)'
      }
    }).add((self) => {
      const {isMobile = false, reduceMotion = false} = self?.matches ?? {};
      const duration = reduceMotion ? 0 : isMobile ? 520 : 700;
      const travel = reduceMotion ? 0 : isMobile ? 14 : 26;

      root.dataset.animeMotion = 'true';

      // Header entrance: targets is the list being animated, duration is the
      // time in ms, ease controls acceleration, and stagger offsets each item.
      const navTargets = root.querySelectorAll('.logo, .nav-actions > *');
      animate(navTargets, {
        opacity: {from: 0, to: 1},
        y: {from: reduceMotion ? 0 : -12, to: 0},
        duration,
        ease: 'out(3)',
        delay: stagger(reduceMotion ? 0 : 55)
      });

      const hero = root.querySelector<HTMLElement>('#home');
      if (hero) {
        // The old CSS reveal hides the entire hero. Anime.js owns this section
        // now, so the parent stays visible while its content enters in sequence.
        hero.classList.remove('reveal');
        utils.set(hero, {opacity: 1, y: 0});

        const heroTargets = hero.querySelectorAll(
          '.huge-title, .role-title, .description, .tags > *, .profile-visual'
        );
        animate(heroTargets, {
          opacity: {from: 0, to: 1},
          y: {from: travel, to: 0},
          scale: {from: isMobile || reduceMotion ? 1 : 0.985, to: 1},
          duration: reduceMotion ? 0 : isMobile ? 560 : 820,
          ease: 'out(4)',
          delay: stagger(reduceMotion ? 0 : isMobile ? 55 : 85)
        });
      }

      const reveal = (element: Element) => {
        if (animatedOnScroll.has(element)) return;
        animatedOnScroll.add(element);

        animate(element, {
          opacity: {from: 0, to: 1},
          y: {from: travel, to: 0},
          duration,
          ease: 'out(3)',
          onComplete: () => {
            // Hand transform control back to existing CSS hover rules (notably
            // the blog card's press-down interaction) after the entrance ends.
            (element as HTMLElement).style.removeProperty('transform');
            (element as HTMLElement).style.removeProperty('opacity');
            element.classList.remove('anime-motion-target');
            element.classList.add('anime-motion-complete');
          }
        });
      };

      intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            reveal(entry.target);
            intersectionObserver?.unobserve(entry.target);
          });
        },
        {
          threshold: isMobile ? 0.08 : 0.14,
          rootMargin: '0px 0px -8% 0px'
        }
      );

      const registerScrollTargets = () => {
        root.querySelectorAll(
          '#journey.reveal, .timeline-item.reveal, .project-card, .blog-card'
        ).forEach((element) => {
          if (observedOnScroll.has(element)) return;
          observedOnScroll.add(element);
          element.classList.add('anime-motion-target');
          utils.set(element, {opacity: 0, y: travel});
          if (reduceMotion) {
            reveal(element);
            return;
          }
          intersectionObserver?.observe(element);
        });
      };

      const registerInteractiveIcons = () => {
        root.querySelectorAll<HTMLElement>(
          '.project-tech-tags span, .skill-badge, .tags .social-icon-btn'
        ).forEach((element, index) => {
          if (interactiveElements.has(element)) return;
          interactiveElements.add(element);

          const enter = () => {
            if (reduceMotion) return;
            animate(element, {
              scale: 1.07,
              rotate: index % 2 === 0 ? -2 : 2,
              duration: 220,
              ease: 'out(3)'
            });
          };
          const leave = () => {
            animate(element, {
              scale: 1,
              rotate: 0,
              duration: reduceMotion ? 0 : 320,
              ease: 'out(4)'
            });
          };

          element.addEventListener('pointerenter', enter);
          element.addEventListener('pointerleave', leave);
          element.addEventListener('focus', enter);
          element.addEventListener('blur', leave);

          listenerCleanups.push(() => {
            element.removeEventListener('pointerenter', enter);
            element.removeEventListener('pointerleave', leave);
            element.removeEventListener('focus', enter);
            element.removeEventListener('blur', leave);
          });
        });
      };

      registerScrollTargets();
      registerInteractiveIcons();

      // Blog cards are rendered into a React portal after the legacy HTML is
      // mounted. Register any late DOM additions without polling.
      mutationObserver = new MutationObserver(() => {
        registerScrollTargets();
        registerInteractiveIcons();
      });
      mutationObserver.observe(root, {childList: true, subtree: true});

      return () => {
        delete root.dataset.animeMotion;
        intersectionObserver?.disconnect();
        mutationObserver?.disconnect();
        listenerCleanups.forEach((cleanup) => cleanup());
      };
    });

    // Reverts every Anime.js instance and runs the listener/observer cleanup
    // registered in the scope when this Next.js view is replaced.
    return () => scope.revert();
  }, [contentKey, rootRef]);

  return null;
}
