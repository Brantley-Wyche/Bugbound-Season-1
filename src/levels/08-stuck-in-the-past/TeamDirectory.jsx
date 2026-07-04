import { useEffect, useState } from 'react';
import { TEAM, fetchProfile } from './fakeApi.js';

export default function TeamDirectory() {
  const [selectedId, setSelectedId] = useState('u1');
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile(selectedId).then(setProfile);
  }, []);

  return (
    <div className="lv-card">
      <h4 className="lv-heading">👥 Team Directory</h4>
      <div className="lv-row">
        {TEAM.map((member) => (
          <button
            key={member.id}
            className={`lv-btn ${member.id === selectedId ? 'active' : ''}`}
            data-testid={`member-${member.id}`}
            onClick={() => setSelectedId(member.id)}
          >
            {member.name}
          </button>
        ))}
      </div>
      {profile ? (
        <div>
          <p className="lv-heading" data-testid="profile-name">{profile.name}</p>
          <p className="lv-muted" data-testid="profile-title">{profile.title}</p>
          <p className="lv-muted">{profile.bio}</p>
        </div>
      ) : (
        <p className="lv-muted">Loading profile…</p>
      )}
    </div>
  );
}
