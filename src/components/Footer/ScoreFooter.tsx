import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLabelInfo } from '../../contexts/LabelInfoContext';
import TrophyImg1 from '../../../public/images/trophy_1.png';
import TrophyImg2 from '../../../public/images/trophy_2.png';
import TrophyImg3 from '../../../public/images/trophy_3.png';

const sceneNames = {
  road: 'Road',
  street: 'Street',
  plane: 'Plane',
} as const;

type SceneKey = keyof typeof sceneNames;

const sceneLabelCounts: Record<SceneKey, number> = {
  street: 5,
  road: 6,
  plane: 4,
};

const ScoreFooter: React.FC = () => {
  const { state } = useLabelInfo();
  const navigate = useNavigate();
  const totalLabels = Object.values(sceneLabelCounts).reduce((a, b) => a + b, 0);
  const totalFound = Object.keys(sceneLabelCounts).reduce((sum, scene) => sum + (Object.values(state[scene] || {}).filter(Boolean).length), 0);


  return (
    <div className='footer-score'>
      <div className="footer-trophies-row">
        {(Object.keys(sceneLabelCounts) as SceneKey[]).map((scene, idx) => {
          const total = sceneLabelCounts[scene];
          const found = Object.values(state[scene] || {}).filter(Boolean).length;
          let trophyImg;
          if (idx === 0) trophyImg = TrophyImg1;
          else if (idx === 1) trophyImg = TrophyImg2;
          else trophyImg = TrophyImg3;
          const isComplete = found === total;
          return (
            <div key={scene} className="footer-trophy-block">
              <img
                src={trophyImg}
                alt={`Trophée ${sceneNames[scene]}`}
                className={`footer-trophy-img${!isComplete ? ' trophy-incomplete' : ''}`}
              />
              <div className="footer-trophy-score">{found} / {total}</div>
            </div>
          );
        })}
      </div>
      {(totalFound === totalLabels) ? (
        <div className='footer-text'>
          <h2 className='text'>
            Congratulations, you've unlocked all the secrets !
          </h2>
          <div className='description'>
            Welcome to the inner circle.
            <br />Our private Discord is reserved for those who see beyond the surface - a space for curated conversations, early access, and privileged insights.
          </div>
            <div className='footer-text'>
                <button className='btn' onClick={() => navigate('/the-hidden-chamber')}>Enter the Chamber</button>
            </div>
        </div>
      ) : (
        <div className='footer-text'>
          <h2 className='text'>
                Some secrets remain hidden.
            </h2>
          <div className='description'>
            Keep exploring—something exciting awaits you.
          </div>
            <div className='footer-text'>
                <a href="mailto:contact@ostrometfils.com" className='btn'>CONTACT</a>
            </div>
        </div>
      )}
    </div>
  );
};

export default ScoreFooter;
