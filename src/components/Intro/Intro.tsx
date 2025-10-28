import { useEffect, useRef, useState } from 'react';
import './Intro.scss';
import introVideo from '/videos/intro.mp4';
import introMobileVideo from '/mobile-assets/videos/intro_mobile_ultra.mp4';
import { useSound } from '../../contexts/SoundContext';

interface IntroProps { hasStarted: boolean; }

const Intro: React.FC<IntroProps> = ({ hasStarted }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false); // fallback if play() fails even after start
  const [isLandscape, setIsLandscape] = useState(false);
  const { registerVideo, unregisterVideo } = useSound();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Register/unregister video for mute management only
  useEffect(() => {
    if (videoRef.current) {
      registerVideo(videoRef.current);
      // Ensure it's paused until hasStarted
      if (!hasStarted) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
    return () => { if (videoRef.current) unregisterVideo(videoRef.current); };
  }, [registerVideo, unregisterVideo, hasStarted]);

  // Start playback only after the journey has begun
  useEffect(() => {
    if (!hasStarted || !videoRef.current) return;
    const v = videoRef.current;
    const playPromise = v.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.then(() => setShowPlayButton(false)).catch(() => {
        // If this still fails (should be unlikely since video is muted), show manual play button
        setShowPlayButton(true);
      });
    }
  }, [hasStarted]);

  // Handle body scroll locking and navbar hiding ONLY in landscape mode
  useEffect(() => {
    if (isLandscape) {
      // Scroll to top first to ensure proper positioning
      window.scrollTo({ top: 0, behavior: 'instant' });
      
      // Request fullscreen mode automatically to hide browser UI
      const requestFullscreen = async () => {
        const introElement = document.getElementById('intro-trigger');
        
        // Detect iPhone/iOS Safari
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        
        // Try multiple approaches aggressively
        const tryFullscreen = async (element: HTMLElement) => {
          try {
            if (element.requestFullscreen) {
              await element.requestFullscreen();
              return true;
            } else if ((element as any).webkitRequestFullscreen) {
              // iOS Safari specific
              await (element as any).webkitRequestFullscreen();
              return true;
            } else if ((element as any).webkitRequestFullscreen) {
              // Alternative iOS method
              await (element as any).webkitRequestFullscreen();
              return true;
            } else if ((element as any).mozRequestFullScreen) {
              await (element as any).mozRequestFullScreen();
              return true;
            } else if ((element as any).msRequestFullscreen) {
              await (element as any).msRequestFullscreen();
              return true;
            }
          } catch (error) {
            console.log('Fullscreen attempt failed:', error);
          }
          return false;
        };

        // iPhone-specific approach: try video element directly
        if (isIOS && videoRef.current) {
          try {
            if ((videoRef.current as any).webkitEnterFullscreen) {
              await (videoRef.current as any).webkitEnterFullscreen();
              return;
            }
          } catch (error) {
            console.log('iPhone video fullscreen failed:', error);
          }
        }

        // Try intro element first
        if (introElement && !document.fullscreenElement) {
          const success = await tryFullscreen(introElement);
          if (!success) {
            // Fallback to document element
            await tryFullscreen(document.documentElement);
          }
        }
      };
      
      // Try fullscreen immediately and retry periodically
      requestFullscreen();
      
      // iPhone-specific: Add user gesture listener for fullscreen
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      let userGestureTriggered = false;
      
      const handleIOSUserGesture = () => {
        if (!userGestureTriggered && isIOS) {
          userGestureTriggered = true;
          requestFullscreen();
          // Remove listeners after first interaction
          document.removeEventListener('touchstart', handleIOSUserGesture);
          document.removeEventListener('click', handleIOSUserGesture);
        }
      };
      
      if (isIOS) {
        document.addEventListener('touchstart', handleIOSUserGesture, { once: true });
        document.addEventListener('click', handleIOSUserGesture, { once: true });
      }
      
      // Retry fullscreen every 500ms for the first 3 seconds
      const retryInterval = setInterval(() => {
        if (!document.fullscreenElement) {
          requestFullscreen();
        } else {
          clearInterval(retryInterval);
        }
      }, 500);
      
      // Clear retry after 3 seconds
      setTimeout(() => clearInterval(retryInterval), 3000);
      
      // Lock body scroll aggressively - iOS Safari specific fixes
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = 'calc(100dvh - 3px)'; // Slightly smaller to prevent cropping
      document.body.style.top = '0';
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.classList.add('landscape-fullscreen');
      
      // Prevent iOS Safari bounce scroll
      document.body.style.overscrollBehavior = 'none';
      (document.body.style as any).WebkitOverflowScrolling = 'none';
      
      // Also lock html element (iOS Safari requirement)
      const html = document.documentElement;
      html.style.overflow = 'hidden';
      html.style.position = 'fixed';
      html.style.width = '100%';
      html.style.height = 'calc(100dvh - 3px)';
      
      // Hide navbar with important flag
      const navbar = document.querySelector('.top-header') as HTMLElement;
      if (navbar) {
        navbar.style.display = 'none';
        navbar.style.visibility = 'hidden';
      }
      
      // Also hide root scroll
      const root = document.getElementById('root');
      if (root) {
        root.style.overflow = 'hidden';
        root.style.position = 'fixed';
        root.style.width = '100%';
        root.style.height = 'calc(100dvh - 3px)'; // Slightly smaller to prevent cropping
        root.style.top = '0';
      }
      
      return () => {
        // Clean up iOS event listeners
        if (isIOS) {
          document.removeEventListener('touchstart', handleIOSUserGesture);
          document.removeEventListener('click', handleIOSUserGesture);
        }
        
        // Exit fullscreen mode
        if (document.fullscreenElement) {
          try {
            if (document.exitFullscreen) {
              document.exitFullscreen();
            } else if ((document as any).webkitExitFullscreen) {
              (document as any).webkitExitFullscreen();
            } else if ((document as any).mozCancelFullScreen) {
              (document as any).mozCancelFullScreen();
            } else if ((document as any).msExitFullscreen) {
              (document as any).msExitFullscreen();
            }
          } catch (error) {
            console.log('Exit fullscreen failed:', error);
          }
        }
        
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overscrollBehavior = '';
        (document.body.style as any).WebkitOverflowScrolling = '';
        document.body.classList.remove('landscape-fullscreen');
        
        // Restore html element
        html.style.overflow = '';
        html.style.position = '';
        html.style.width = '';
        html.style.height = '';
        
        // Show navbar again
        if (navbar) {
          navbar.style.display = '';
          navbar.style.visibility = '';
        }
        
        // Restore root scroll
        if (root) {
          root.style.overflow = '';
          root.style.position = '';
          root.style.width = '';
          root.style.height = '';
          root.style.top = '';
        }
      };
    } else {
      // Portrait mode: immediately exit fullscreen and reset all styles
      
      // Exit fullscreen mode first - be aggressive about it
      const exitFullscreen = async () => {
        if (document.fullscreenElement) {
          try {
            if (document.exitFullscreen) {
              await document.exitFullscreen();
            } else if ((document as any).webkitExitFullscreen) {
              await (document as any).webkitExitFullscreen();
            } else if ((document as any).mozCancelFullScreen) {
              await (document as any).mozCancelFullScreen();
            } else if ((document as any).msExitFullscreen) {
              await (document as any).msExitFullscreen();
            }
          } catch (error) {
            console.log('Exit fullscreen failed:', error);
          }
        }
      };
      
      // Try to exit fullscreen immediately
      exitFullscreen();
      
      // Also try again after a short delay to ensure it works
      setTimeout(() => {
        exitFullscreen();
      }, 100);
      
      // Force scroll to top to ensure proper positioning
      window.scrollTo({ top: 0, behavior: 'instant' });
      
      // Reset all body styles immediately
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overscrollBehavior = '';
      (document.body.style as any).WebkitOverflowScrolling = '';
      document.body.classList.remove('landscape-fullscreen');
      
      // Restore html element
      const html = document.documentElement;
      html.style.overflow = '';
      html.style.position = '';
      html.style.width = '';
      html.style.height = '';
      
      // Show navbar again
      const navbar = document.querySelector('.top-header') as HTMLElement;
      if (navbar) {
        navbar.style.display = '';
        navbar.style.visibility = '';
      }
      
      // Restore root scroll
      const root = document.getElementById('root');
      if (root) {
        root.style.overflow = '';
        root.style.position = '';
        root.style.width = '';
        root.style.height = '';
        root.style.top = '';
      }
    }
  }, [isLandscape]);

  useEffect(() => {
    // Don't use IntersectionObserver in landscape mode - video should play continuously
    if (isLandscape) return;

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (videoRef.current) {
          // Only manage playback visibility AFTER start
          if (!hasStarted) return;
          if (entry.isIntersecting) {
            const playPromise = videoRef.current.play();
            if (playPromise) playPromise.catch(() => setShowPlayButton(true));
          } else {
            videoRef.current.pause();
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.5, // Adjust threshold as needed
    });

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, [hasStarted, isLandscape]);

  // Ensure video plays continuously in landscape mode
  useEffect(() => {
    if (isLandscape && hasStarted && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise) {
        playPromise.catch((error) => {
          console.log('Landscape video play failed:', error);
          setShowPlayButton(true);
        });
      }
    }
  }, [isLandscape, hasStarted]);

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  const handlePlayClick = () => {
    if (!videoRef.current) return;
    videoRef.current.play().then(() => setShowPlayButton(false)).catch((error) => {
      console.error('Failed to play video manually:', error);
    });
  };

  return (
    <div className={`intro ${isLandscape ? 'intro--landscape' : 'intro--portrait'}`} id="intro-trigger">
      <video
        ref={videoRef}
        className={`intro__video ${isLandscape ? 'intro__video--landscape' : 'intro__video--portrait'}`}
        src={isMobile ? introMobileVideo : introVideo}
        // Removed autoPlay: we manually start after loader completion
        muted
        loop
        playsInline
        preload={isMobile ? "auto" : "metadata"}
      ></video>
      
      
      {hasStarted && showPlayButton && (
        <div className="intro__play-button" onClick={handlePlayClick}>
          <div className="play-icon">
            <svg width="20px" height="20px" viewBox="-3 0 28 28" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                    <g id="Icon-Set-Filled" transform="translate(-419.000000, -571.000000)" fill="currentColor">
                        <path d="M440.415,583.554 L421.418,571.311 C420.291,570.704 419,570.767 419,572.946 L419,597.054 C419,599.046 420.385,599.36 421.418,598.689 L440.415,586.446 C441.197,585.647 441.197,584.353 440.415,583.554" id="play"></path>
                    </g>
                </g>
            </svg>
          </div>
        </div>
      )}
      <div className="intro__arrow active-follower" onClick={scrollToContent}>
        <span></span>
      </div>
      <div className='gradient-under'></div>
    </div>
  );
};

export default Intro;