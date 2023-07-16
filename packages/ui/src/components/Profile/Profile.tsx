import { User } from "@carbon/icons-react";
import { settings } from "../../constants/settings";
import classnames from "classnames";
import { useProfile } from "./useProfile";
import {   // @ts-ignore
  HeaderGlobalAction, Button } from "@carbon/react";
import ProfileContent from "./ProfileContent";

type Props = {};

const Profile = () => {
  const {
    ref,
    isOpen,
    shouldRender,
    expandProfile,
    userProfile,
    handleSignout,
    setShouldRender,
  } = useProfile();
  const fullName =
    // @ts-ignore-next-line

    userProfile.userSession.session.user.user_metadata?.first_name +
    " " +
    // @ts-ignore-next-line

    userProfile.userSession.session.user.user_metadata?.last_name;

  // @ts-ignore-next-line

  const platform = userProfile.userSession.session.user.user_metadata?.platform;

  return (
    <HeaderGlobalAction aria-label="Perfil" onClick={expandProfile}>
      <User size={20} />

      <div id={settings.sipePrefix}>
        {shouldRender && (
          <div
            className={classnames(`${settings.sipePrefix}--profile-container`)}
            style={{
              animation: `${isOpen ? "fade-in 250ms" : "fade-out 250ms"}`,
            }}
            ref={ref}
            onAnimationEnd={() => {
              !isOpen && setShouldRender(false);
            }}
          >
            <ProfileContent
              name={fullName}
              platform={platform}
              // @ts-ignore-next-line

              email={userProfile.userSession.session.user.email}
              onLogout={handleSignout}
            />
          </div>
        )}
      </div>
    </HeaderGlobalAction>
  );
};

export default Profile;
