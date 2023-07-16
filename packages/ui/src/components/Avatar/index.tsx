//User chip component
import classnames from "classnames";
import { settings } from "../../constants/settings";

type AvatarProps = {
  userName: string;
  size?: number;
};

function Avatar(props: AvatarProps) {

  //Define style for the chip
  const size = props.size ? props.size : 32;
  const radius = size/2;

  let avatarStyle = {
    width: size + `px`,
    height: size + `px`,
    borderRadius: size/2 + `px`,
  };

  const chipText = props.userName? props.userName
    .toString()
    .split(" ")
    .map((i) => i.charAt(0))
    .join("") : "";

  return (
    <div className={classnames(`${settings.sipePrefix}--kanban-issue-chip`)} style={avatarStyle}>
      {chipText}
    </div>
  );
}
export default Avatar;
