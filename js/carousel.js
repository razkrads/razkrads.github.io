/**
 * Podcast Carousel and Episode functionality for ASP website
 */

document.addEventListener('DOMContentLoaded', async function() {
    // Program data with correct color schemes and data attributes.
    // The description will be updated dynamically with the Spotify show description.
    const programData = [
      {
        title: "PJÆK",
        description: "PLACEHOLDER",
        embedUrl: "https://open.spotify.com/embed/show/6fbzL4lN39CuZAvktQhaf4?utm_source=generator",
        color: "var(--pjaek-color)",
        dataAttr: "pjaek"
      },
      {
        title: "DEN ÅBNE KANAL",
        description: "PLACEHOLDER",
        embedUrl: "https://open.spotify.com/embed/show/2caefOQ9XLNrvCNXGOmcxY?utm_source=generator",
        color: "var(--den-abne-color)",
        dataAttr: "den-abne"
      },
      {
        title: "UNI LIV",
        description: "PLACEHOLDER",
        embedUrl: "https://open.spotify.com/embed/show/2EJrewktCX7msAhRAUyrzj?utm_source=generator",
        color: "var(--uni-liv-color)",
        dataAttr: "uni-liv"
      },
      {
        title: "UDEN FOR PENSUM",
        description: "PLACEHOLDER",
        embedUrl: "https://open.spotify.com/embed/show/2nTK4FF2Mp3JBZQXxBsFkZ?utm_source=generator",
        color: "var(--ufp-color)",
        dataAttr: "ufp"
      },
      {
        title: "MIDDELALDERLIG",
        description: "PLACEHOLDER",
        embedUrl: "https://open.spotify.com/embed/show/6RH2WKn38xV704FNx84NTq?utm_source=generator",
        color: "var(--middelalderlig-color)",
        dataAttr: "middelalderlig"
      },
      {
        title: "STUDIEGUIDEN",
        description: "PLACEHOLDER",
        embedUrl: "https://open.spotify.com/embed/show/2Az7AHa4U6cGXrDWBFk7GG?utm_source=generator",
        color: "var(--studieguiden-color)",
        dataAttr: "studieguiden"
      },
      {
        title: "PROFUNDIS",
        description: "PLACEHOLDER",
        embedUrl: "https://open.spotify.com/embed/show/0Ft4JVXlFzTWyRaWjazhbh?utm_source=generator",
        color: "var(--profundis-color)",
        dataAttr: "profundis"
      }
    ];
    
    // Spotify API configuration
    const spotifyConfig = {
      clientId: '916bf82632c1453e8e49a4924d2238e0',
      clientSecret: '6b06e6b93e2e43579c23736998e0e30d',
      showIds: {
        'pjaek': '6fbzL4lN39CuZAvktQhaf4',
        'den-abne': '2caefOQ9XLNrvCNXGOmcxY',
        'uni-liv': '2EJrewktCX7msAhRAUyrzj',
        'ufp': '2nTK4FF2Mp3JBZQXxBsFkZ',
        'middelalderlig': '6RH2WKn38xV704FNx84NTq',
        'studieguiden': '2Az7AHa4U6cGXrDWBFk7GG',
        'profundis': '0Ft4JVXlFzTWyRaWjazhbh'
      }
    };
    
    // Cache for episode data
    const episodeCache = {};
    
    // Function to dynamically fetch a Spotify access token
    async function getSpotifyAccessToken() {
      const authString = btoa(`${spotifyConfig.clientId}:${spotifyConfig.clientSecret}`);
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${authString}`
        },
        body: 'grant_type=client_credentials'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch Spotify access token');
      }
      const data = await response.json();
      return data.access_token;
    }
    
    // Function to fetch show details so we can update the description
    async function fetchShowDetails(programId) {
      const showId = spotifyConfig.showIds[programId];
      if (!showId) {
        throw new Error('Unknown program ID: ' + programId);
      }
      const accessToken = await getSpotifyAccessToken();
      const response = await fetch(`https://api.spotify.com/v1/shows/${showId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch show details for ' + programId);
      }
      return await response.json();
    }
    
    // Replace the "PLACEHOLDER" description with the Spotify description for each program
    try {
      await Promise.all(programData.map(async (program) => {
        try {
          const details = await fetchShowDetails(program.dataAttr);
          program.description = details.description;
        } catch (err) {
          console.error(`Error updating description for ${program.title}:`, err);
        }
      }));
    } catch (error) {
      console.error('Error fetching program descriptions:', error);
    }
    
    // Function to fetch episodes for a given program ID
    async function fetchEpisodes(programId) {
      if (episodeCache[programId]) {
        return episodeCache[programId];
      }
    
      const showId = spotifyConfig.showIds[programId];
      if (!showId) {
        throw new Error('Unknown program ID: ' + programId);
      }
    
      try {
        const accessToken = await getSpotifyAccessToken();
        const response = await fetch(`https://api.spotify.com/v1/shows/${showId}/episodes?market=DK&limit=10`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
    
        if (!response.ok) {
          return getBackupData(programId);
        }
    
        const data = await response.json();
        const episodes = data.items.map(item => ({
          title: item.name,
          date: formatDate(item.release_date),
          duration: formatDuration(item.duration_ms),
          description: item.description,
          image: item.images[0].url,
          spotifyUrl: item.external_urls.spotify
        }));
    
        episodeCache[programId] = episodes;
        return episodes;
      } catch (error) {
        console.error('Error fetching Spotify data:', error);
        return getBackupData(programId);
      }
    }
    
    // Dummy backup data in case Spotify API fails
    function getBackupData(programId) {
      if (programId !== 'ufp') {
        return [{
          title: "Eksempel Episode",
          date: "26. Feb 2025",
          duration: "30 min",
          description: "Dette er en eksempel episode da vi ikke kunne få forbindelse til Spotify API'et.",
          image: "https://i.scdn.co/image/ab6765630000ba8ae85b947148409d6f059e73e6",
          spotifyUrl: "#"
        }];
      }
      const backupData = {
        "items": [
          {
            "description": "Vi er tilbage! Humøret er højt og vi har lidt forskelligt med i dagens episode.",
            "duration_ms": 2661616,
            "external_urls": {"spotify": "https://open.spotify.com/episode/5Vn3IKRXaLMuIcDCDvUKsV"},
            "images": [{"url": "https://i.scdn.co/image/ab6765630000ba8ae85b947148409d6f059e73e6"}],
            "name": "EP.7 En mikro-influencer i hot water, europæiske alternativer og kryolit sagen",
            "release_date": "2025-02-14"
          }
          // Additional backup episodes...
        ]
      };
      return backupData.items.map(item => ({
        title: item.name,
        date: formatDate(item.release_date),
        duration: formatDuration(item.duration_ms),
        description: item.description,
        image: item.images[0].url,
        spotifyUrl: item.external_urls.spotify
      }));
    }
    
    // Helper functions
    function formatDuration(ms) {
      const minutes = Math.floor(ms / 60000);
      return minutes + ' min';
    }
    
    function formatDate(dateStr) {
      const date = new Date(dateStr);
      const options = { day: 'numeric', month: 'short', year: 'numeric' };
      return date.toLocaleDateString('da-DK', options);
    }
    
    // Initialize the coverflow carousel using the updated programData
    initCoverflowCarousel(programData);
    
    function initCoverflowCarousel(programData) {
      const coverflowTrack = document.querySelector('.coverflow-track');
      const dotsContainer = document.querySelector('.carousel-dots');
      const nextBtn = document.querySelector('.coverflow-carousel-container .next-btn');
      const prevBtn = document.querySelector('.coverflow-carousel-container .prev-btn');
      
      if (!coverflowTrack) return;
      
      let currentIndex = 2; // Start with UNI LIV as the active card (index 2)
      const totalSlides = programData.length;
      let isAnimating = false;
      
      function generateSlides() {
        coverflowTrack.innerHTML = '';
        dotsContainer.innerHTML = '';
        
        programData.forEach((program, index) => {
          const slide = document.createElement('div');
          slide.className = 'coverflow-slide';
          slide.dataset.index = index;
          slide.dataset.program = program.dataAttr;
          
          slide.innerHTML = `
            <div class="show-card">
              <div class="show-image">
                <iframe style="border-radius:12px" 
                        src="${program.embedUrl}" 
                        frameBorder="0" 
                        allowfullscreen="" 
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                        loading="lazy"></iframe>
              </div>
              <div class="show-content">
                <h3 class="show-title">${program.title}</h3>
                <p class="show-description">${program.description}</p>
                <div class="play-now">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  SE EPISODER
                </div>
              </div>
            </div>
          `;
          
          coverflowTrack.appendChild(slide);
          
          const dot = document.createElement('span');
          dot.className = 'dot';
          dot.dataset.index = index;
          dotsContainer.appendChild(dot);
          
          dot.addEventListener('click', () => {
            if (!isAnimating && index !== currentIndex) {
              goToSlide(index);
            }
          });
          
          slide.addEventListener('click', () => {
            if (!isAnimating && index !== currentIndex) {
              goToSlide(index);
            }
          });
        });
        
        setupEpisodeButtons();
      }
      
      function updateSlidePositions() {
        const slides = document.querySelectorAll('.coverflow-slide');
        slides.forEach(slide => {
          slide.classList.remove('active', 'prev', 'next', 'prev-2', 'next-2', 'far-left', 'far-right');
          const slideIndex = parseInt(slide.dataset.index);
          const relativeDiff = getRelativePosition(slideIndex, currentIndex);
          if (relativeDiff === 0) {
            slide.classList.add('active');
          } else if (relativeDiff === -1 || relativeDiff === totalSlides - 1) {
            slide.classList.add('prev');
          } else if (relativeDiff === 1 || relativeDiff === -(totalSlides - 1)) {
            slide.classList.add('next');
          } else if (relativeDiff === -2 || relativeDiff === totalSlides - 2) {
            slide.classList.add('prev-2');
          } else if (relativeDiff === 2 || relativeDiff === -(totalSlides - 2)) {
            slide.classList.add('next-2');
          } else if (relativeDiff < -2) {
            slide.classList.add('far-left');
          } else if (relativeDiff > 2) {
            slide.classList.add('far-right');
          }
        });
        
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
          dot.classList.toggle('active', index === currentIndex);
        });
      }
      
      function getRelativePosition(index, currentIndex) {
        let diff = index - currentIndex;
        if (diff > totalSlides / 2) {
          diff -= totalSlides;
        } else if (diff < -totalSlides / 2) {
          diff += totalSlides;
        }
        return diff;
      }
      
      function goToSlide(index) {
        if (isAnimating) return;
        isAnimating = true;
        currentIndex = index;
        if (currentIndex < 0) currentIndex = totalSlides - 1;
        if (currentIndex >= totalSlides) currentIndex = 0;
        updateSlidePositions();
        setTimeout(() => {
          isAnimating = false;
        }, 500);
      }
      
      generateSlides();
      updateSlidePositions();
      
      if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
          e.preventDefault();
          if (!isAnimating) {
            goToSlide(currentIndex + 1);
          }
        });
      }
      
      if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
          e.preventDefault();
          if (!isAnimating) {
            goToSlide(currentIndex - 1);
          }
        });
      }
      
      document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
          if (!isAnimating) {
            goToSlide(currentIndex - 1);
          }
        } else if (e.key === 'ArrowRight') {
          if (!isAnimating) {
            goToSlide(currentIndex + 1);
          }
        }
      });
      
      // Touch support
      let touchStartX = 0;
      let touchEndX = 0;
      let touchStartTime = 0;
      
      coverflowTrack.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartTime = new Date().getTime();
      });
      
      coverflowTrack.addEventListener('touchend', (e) => {
        if (isAnimating) return;
        touchEndX = e.changedTouches[0].screenX;
        const touchEndTime = new Date().getTime();
        const touchDuration = touchEndTime - touchStartTime;
        const touchDistance = Math.abs(touchEndX - touchStartX);
        const velocity = touchDistance / touchDuration;
        const swipeThreshold = velocity > 0.5 ? 30 : 50;
        if (touchEndX < touchStartX - swipeThreshold) {
          goToSlide(currentIndex + 1);
        } else if (touchEndX > touchStartX + swipeThreshold) {
          goToSlide(currentIndex - 1);
        }
      });
      
      // Resize handler
      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          updateSlidePositions();
        }, 250);
      });
    }
    
    // ----- EPISODE MODAL FUNCTIONALITY -----
    
    function createEpisodeModal() {
      if (document.getElementById('episode-modal')) return;
    
      const modalHTML = `
        <div id="episode-modal" class="episode-modal">
          <div class="episode-modal-content">
            <div class="episode-modal-header">
              <h2 id="modal-program-title">Program Episodes</h2>
              <span class="close-modal">&times;</span>
            </div>
            <div class="episode-modal-body">
              <!-- New program description container -->
              <div id="modal-program-description" class="modal-program-description"></div>
              <div id="episodes-loading" class="episodes-loading">
                <div class="spinner"></div>
                <span>Henter episoder...</span>
              </div>
              <div id="episodes-error" class="episodes-error" style="display: none;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p>Der opstod en fejl ved hentning af episoder.</p>
                <button id="retry-button" class="retry-button">Prøv igen</button>
              </div>
              <ul id="episodes-list" class="episodes-list" style="display: none;"></ul>
            </div>
          </div>
        </div>
      `;
    
      const modalContainer = document.createElement('div');
      modalContainer.innerHTML = modalHTML;
      document.body.appendChild(modalContainer.firstElementChild);
    
      const closeBtn = document.querySelector('.episode-modal .close-modal');
      const modal = document.getElementById('episode-modal');
    
      if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
          modal.style.display = 'none';
        });
    
        window.addEventListener('click', (e) => {
          if (e.target === modal) {
            modal.style.display = 'none';
          }
        });
    
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
          }
        });
      }
    }
    
    // Updated showEpisodes now accepts a fourth parameter for the program description.
    async function showEpisodes(programId, programTitle, colorVar, programDescription) {
      createEpisodeModal();
    
      const modal = document.getElementById('episode-modal');
      const modalTitle = document.getElementById('modal-program-title');
      const modalProgDesc = document.getElementById('modal-program-description');
      const episodesList = document.getElementById('episodes-list');
      const loadingElement = document.getElementById('episodes-loading');
      const errorElement = document.getElementById('episodes-error');
    
      if (!modal || !modalTitle || !modalProgDesc || !episodesList || !loadingElement || !errorElement) {
        console.error('Missing modal elements');
        return;
      }
    
      modalTitle.textContent = programTitle;
      modalTitle.style.color = colorVar;
      // Set the program description at the top of the modal.
      modalProgDesc.innerHTML = programDescription;
    
      episodesList.style.display = 'none';
      loadingElement.style.display = 'flex';
      errorElement.style.display = 'none';
    
      modal.style.display = 'block';
    
      try {
        const episodes = await fetchEpisodes(programId);
        episodesList.innerHTML = '';
    
        if (episodes.length === 0) {
          episodesList.innerHTML = '<li class="no-episodes">Ingen episoder tilgængelige</li>';
        } else {
          episodes.forEach(episode => {
            const episodeItem = document.createElement('li');
            episodeItem.className = 'episode-item';
            episodeItem.innerHTML = `
              <div class="episode-header">
                <div class="episode-image">
                  <img src="${episode.image}" alt="${episode.title}">
                </div>
                <div class="episode-info">
                  <h3 class="episode-title">${episode.title}</h3>
                  <div class="episode-meta">
                    <span class="episode-date">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      ${episode.date}
                    </span>
                    <span class="episode-duration">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      ${episode.duration}
                    </span>
                  </div>
                </div>
              </div>
              <p class="episode-description">${episode.description}</p>
              <a href="${episode.spotifyUrl}" target="_blank" class="listen-button" style="color: ${colorVar}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                Lyt På Spotify
              </a>
            `;
            episodesList.appendChild(episodeItem);
          });
        }
    
        loadingElement.style.display = 'none';
        episodesList.style.display = 'block';
      } catch (error) {
        console.error('Error showing episodes:', error);
        loadingElement.style.display = 'none';
        errorElement.style.display = 'flex';
        const retryButton = document.getElementById('retry-button');
        if (retryButton) {
          retryButton.onclick = () => {
            showEpisodes(programId, programTitle, colorVar, programDescription);
          };
        }
      }
    }
    
    // Update setupEpisodeButtons() to pass along the program description
    function setupEpisodeButtons() {
      document.querySelectorAll('.coverflow-slide').forEach(slide => {
        const playButton = slide.querySelector('.play-now');
        const programId = slide.dataset.program;
        const programTitle = slide.querySelector('.show-title').textContent;
        const program = programData.find(p => p.dataAttr === programId);
        const color = program ? program.color : 'var(--primary)';
        const programDescription = program ? program.description : '';
    
        if (playButton && programId) {
          const newPlayButton = playButton.cloneNode(true);
          playButton.parentNode.replaceChild(newPlayButton, playButton);
          newPlayButton.addEventListener('click', (e) => {
            e.stopPropagation();
            showEpisodes(programId, programTitle, color, programDescription);
          });
        }
      });
    }
  });