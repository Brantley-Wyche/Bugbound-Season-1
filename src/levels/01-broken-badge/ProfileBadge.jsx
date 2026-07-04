export default function ProfileBadge() {
  const user = { name: 'Ada Lovelace', role: 'Staff Engineer', team: 'Platform' };

  return (
    <div className="lv-card" data-testid="badge" style="max-width: 320px">
      <h3 className="lv-heading" data-testid="badge-name">user.name</h3>
      <p className="lv-muted" data-testid="badge-role">
        {user.role} · {user.team}
      </p>
      <span className="lv-tag" data-testid="badge-tag">Verified</span>
    </div>
  );
}
