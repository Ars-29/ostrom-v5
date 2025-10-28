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
  const [showAndroidTapHint, setShowAndroidTapHint] = useState(false);
  const { registerVideo, unregisterVideo } = useSound();

  useEffect(() => {
    const handleResize = () => {
      // Dynamic mobile detection based on device capabilities
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // More sophisticated screen size detection
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const isPortrait = screenWidth < screenHeight;
      
      // Mobile detection: touch device + reasonable screen size
      // Portrait: width < 600px OR height < 900px
      // Landscape: height < 600px OR width < 900px
      const isSmallScreen = isPortrait ? 
        (screenWidth < 600 || screenHeight < 900) :
        (screenHeight < 600 || screenWidth < 900);
      
      // Additional check: ensure it's not a desktop with touch (like Surface)
      const isDefinitelyMobile = isTouchDevice && isSmallScreen && screenWidth < 1024;
      
      setIsMobile(isDefinitelyMobile);
      setIsLandscape(screenWidth > screenHeight);
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

  // Handle body scroll locking and navbar hiding ONLY in landscape mode on mobile
  useEffect(() => {
    if (isLandscape && isMobile) {
      // Scroll to top first to ensure proper positioning
      window.scrollTo({ top: 0, behavior: 'instant' });
      
      // Small delay to ensure browser is ready for fullscreen
      const requestFullscreen = async () => {
        const introElement = document.getElementById('intro-trigger');
        
        // Detect iPhone/iOS Safari and Android
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
        
        console.log('Requesting fullscreen for:', { isIOS, isAndroid, isMobile, isLandscape });
        
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

        // Android-specific approach: try video element directly FIRST
        if (isAndroid && videoRef.current) {
          try {
            console.log('Trying Android webkitEnterFullscreen on video');
            if ((videoRef.current as any).webkitEnterFullscreen) {
              await (videoRef.current as any).webkitEnterFullscreen();
              console.log('Android video fullscreen SUCCESS');
              return;
            }
          } catch (error) {
            console.log('Android video fullscreen failed:', error);
          }
        }

        // iPhone-specific approach: try video element directly FIRST
        if (isIOS && videoRef.current) {
          try {
            console.log('Trying iOS webkitEnterFullscreen on video');
            if ((videoRef.current as any).webkitEnterFullscreen) {
              await (videoRef.current as any).webkitEnterFullscreen();
              console.log('iOS video fullscreen SUCCESS');
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
      
      // Try fullscreen immediately with a small delay to ensure browser readiness
      setTimeout(() => {
        requestFullscreen();
      }, 100);
      
      // Also try immediately (in case the delay isn't needed)
      requestFullscreen();
      
      // iPhone-specific: Add user gesture listener for fullscreen
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      let userGestureTriggered = false;
      
      const handleUserGesture = () => {
        if (!userGestureTriggered && (isIOS || isAndroid)) {
          userGestureTriggered = true;
          requestFullscreen();
          // Remove listeners after first interaction
          document.removeEventListener('touchstart', handleUserGesture);
          document.removeEventListener('click', handleUserGesture);
        }
      };
      
      if (isIOS || isAndroid) {
        document.addEventListener('touchstart', handleUserGesture, { once: true });
        document.addEventListener('click', handleUserGesture, { once: true });
      }
      
      // Retry fullscreen every 200ms for the first 5 seconds (more aggressive)
      const retryInterval = setInterval(() => {
        if (!document.fullscreenElement) {
          console.log('Retrying fullscreen...');
          requestFullscreen();
        } else {
          console.log('Fullscreen achieved!');
          clearInterval(retryInterval);
        }
      }, 200);
      
      // Clear retry after 5 seconds
      setTimeout(() => {
        clearInterval(retryInterval);
        console.log('Stopped retrying fullscreen');
      }, 5000);
      
      // Show tap hint for Android devices after 1 second if not in fullscreen
      if (isAndroid) {
        setTimeout(() => {
          if (!document.fullscreenElement) {
            console.log('Showing Android tap hint');
            setShowAndroidTapHint(true);
          }
        }, 1000);
        
        // For Android: Try multiple approaches to trigger fullscreen
        setTimeout(() => {
          if (!document.fullscreenElement) {
            console.log('Android: Trying multiple fullscreen triggers');
            
            // 1. Focus the video element
            if (videoRef.current) {
              videoRef.current.focus();
            }
            
            // 2. Create synthetic events
            const touchEvent = new TouchEvent('touchstart', {
              bubbles: true,
              cancelable: true,
              touches: [new Touch({
                identifier: 0,
                target: videoRef.current || document.body,
                clientX: 0,
                clientY: 0,
                screenX: 0,
                screenY: 0,
                pageX: 0,
                pageY: 0
              })]
            });
            document.dispatchEvent(touchEvent);
            
            // Also try a click event
            const clickEvent = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              clientX: 0,
              clientY: 0
            });
            if (videoRef.current) {
              videoRef.current.dispatchEvent(clickEvent);
            }
            
            // 3. Try fullscreen again after focus
            setTimeout(() => {
              if (!document.fullscreenElement) {
                requestFullscreen();
              }
            }, 100);
          }
        }, 500);
      }
      
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
        // Clean up iOS and Android event listeners
        if (isIOS || isAndroid) {
          document.removeEventListener('touchstart', handleUserGesture);
          document.removeEventListener('click', handleUserGesture);
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
    } else if (isMobile) {
      // Portrait mode on mobile: immediately exit fullscreen and reset all styles
      
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
  }, [isLandscape, isMobile]);

  useEffect(() => {
    // Don't use IntersectionObserver in landscape mode on mobile - video should play continuously
    if (isLandscape && isMobile) return;

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
  }, [hasStarted, isLandscape, isMobile]);

  // Ensure video plays continuously in landscape mode on mobile
  useEffect(() => {
    if (isLandscape && isMobile && hasStarted && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise) {
        playPromise.catch((error) => {
          console.log('Landscape video play failed:', error);
          setShowPlayButton(true);
        });
      }
    }
  }, [isLandscape, isMobile, hasStarted]);

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  const handleAndroidTapHintClick = () => {
    setShowAndroidTapHint(false);
    // Try fullscreen again when user taps
    if (videoRef.current) {
      const requestFullscreen = async () => {
        try {
          console.log('Android tap hint clicked - trying fullscreen');
          if (videoRef.current && (videoRef.current as any).webkitEnterFullscreen) {
            await (videoRef.current as any).webkitEnterFullscreen();
            console.log('Android tap hint fullscreen SUCCESS');
          } else if (videoRef.current && videoRef.current.requestFullscreen) {
            await videoRef.current.requestFullscreen();
            console.log('Android tap hint requestFullscreen SUCCESS');
          }
        } catch (error) {
          console.log('Android tap fullscreen failed:', error);
        }
      };
      requestFullscreen();
    }
  };

  const handleVideoClick = () => {
    // Handle video click for fullscreen on mobile landscape
    if (isLandscape && isMobile && videoRef.current) {
      console.log('Video clicked in landscape mode - trying fullscreen');
      
      const requestFullscreen = async () => {
        try {
          if (videoRef.current && (videoRef.current as any).webkitEnterFullscreen) {
            await (videoRef.current as any).webkitEnterFullscreen();
            console.log('Video click fullscreen SUCCESS');
          } else if (videoRef.current && videoRef.current.requestFullscreen) {
            await videoRef.current.requestFullscreen();
            console.log('Video click requestFullscreen SUCCESS');
          }
        } catch (error) {
          console.log('Video click fullscreen failed:', error);
        }
      };
      requestFullscreen();
    }
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
        onClick={handleVideoClick}
        // Show native video controls in landscape mode on mobile (iOS & Android)
        controls={isLandscape && isMobile}
        controlsList="nodownload"
        disablePictureInPicture={false}
        // Additional attributes for better fullscreen support
        webkit-playsinline="true"
        x5-video-player-type="h5"
        x5-video-player-fullscreen="true"
        x5-video-orientation="landscape"
      ></video>
      
      {/* Android tap hint for fullscreen */}
      {isLandscape && isMobile && showAndroidTapHint && !document.fullscreenElement && (
        <div className="intro__android-tap-hint" onClick={handleAndroidTapHintClick}>
          <div className="hint-content">
            <span className="hint-icon">📱</span>
            <span className="hint-text">Tap video to hide browser UI</span>
          </div>
        </div>
      )}
      
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