import classnames from "classnames";
import { settings } from "../../constants/settings";
import Avatar from "../Avatar";
import {
  // @ts-ignore

  Button,
  // @ts-ignore

  ContainedList,
  // @ts-ignore

  ExpandableSearch,
  // @ts-ignore

  ContainedListItem,
} from "@carbon/react";

type Props = {
  email: string;
  name: string;
  platform: string;
  onLogout?: () => void;
};

const ProfileContent = ({ email, name, platform, onLogout }: Props) => {
  return (
    <div className={classnames(`${settings.sipePrefix}--profile-content`)}>
      <div className={classnames(`${settings.sipePrefix}--profile-header`)}>
        <Avatar size={48} userName={name} />
        <div className={classnames(`${settings.sipePrefix}--profile-name`)}>
          <span>{name}</span>
          <br />
          <p>{email}</p>
          <p>{platform}</p>

        </div>
      </div>
      <ContainedList label="Meu Perfil" kind="disclosed" size="md">
        <ContainedListItem
          action={() => console.log("action")}
          onClick={() => console.log("click")}
        >
          Configurações
        </ContainedListItem>
        <ContainedListItem
          action={() => console.log("action")}
          onClick={
            onLogout
              ? onLogout
              : () => {
                console.log("not implemented");
              }
          }
        >
          Logout
        </ContainedListItem>
      </ContainedList>{" "}
    </div>
  );
};

export default ProfileContent;
