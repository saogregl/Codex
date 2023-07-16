import { User } from "@carbon/icons-react";
import { settings } from "../../constants/settings";
import classnames from "classnames";
import { useProfile } from "./useProfile";
import {   // @ts-ignore
  HeaderGlobalAction, Button
} from "@carbon/react";
import ProfileContent from "./ProfileContent";

type Props = {};

const Profile = () => {
  const {
    ref,
    isOpen,
    shouldRender,
    expandProfile,
    // userProfile,
    handleSignout,
    setShouldRender,
  } = useProfile();
  const fullName ="User Name"; // userProfile.userSession.session.user.user_metadata?.full_name || "
  const platform = "Plataforma";

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

              email={"email@jacto.com.br"}
              onLogout={handleSignout}
            />
          </div>
        )}
      </div>
    </HeaderGlobalAction>
  );
};

export default Profile;
