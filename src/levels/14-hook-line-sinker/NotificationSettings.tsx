import { useToggle } from './useToggle';

export default function NotificationSettings() {
  const [emailOn, toggleEmail] = useToggle(true);
  const [pushOn, togglePush] = useToggle(false);

  return (
    <div className="lv-card">
      <h4 className="lv-heading">⚙️ Notification Settings</h4>

      <div className="lv-row spread">
        <span>Email digests</span>
        <span className="lv-tag" data-testid="email-state">{emailOn ? 'On' : 'Off'}</span>
        <button className="lv-btn" data-testid="email-toggle" onClick={toggleEmail}>
          Toggle
        </button>
      </div>

      <div className="lv-row spread">
        <span>Push notifications</span>
        <span className="lv-tag" data-testid="push-state">{pushOn ? 'On' : 'Off'}</span>
        <button className="lv-btn" data-testid="push-toggle" onClick={togglePush}>
          Toggle
        </button>
      </div>
    </div>
  );
}
