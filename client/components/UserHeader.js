const UserHeader = ({ username, onLogout, onDeleteAccount }) => {
  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This will permanently remove all your contacts.'
    );
    if (confirmed) {
      onDeleteAccount();
    }
  };

  return (
    <div className="user-header">
      <span className="user-header-greeting">
        Signed in as <strong>{username}</strong>
      </span>
      <div className="user-header-actions">
        <button
          className="user-header-btn logout-btn"
          onClick={onLogout}
          aria-label="Sign out"
        >
          Sign out
        </button>
        <button
          className="user-header-btn delete-btn"
          onClick={handleDeleteAccount}
          aria-label="Delete account"
        >
          Delete account
        </button>
      </div>
    </div>
  );
};

export default UserHeader;
