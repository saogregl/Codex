// ts-ignore
import {
  // @ts-ignore
  Button,
  // @ts-ignore
  TextInput,
} from "@carbon/react";
import Avatar from "../../Avatar";

function Comment() {
  //const { data: session } = useSession();
  return (
    <div style={{}}>
      <div style={{ display: "flex", flexDirection: "row", gap: "5px" }}>
        <div style={{ padding: "5px 0px" }}>
          <Avatar userName={"Lucas"} />
        </div>
        <div
          style={{
            width: "100%",
            gap: "16px",
          }}
        >
          <TextInput
            className="input-test-class"
            id="text-input-1"
            invalidText="Error message goes here"
            onChange={() => { console.log("change") }}
            onClick={() => { console.log("click") }}
            placeholder="Comentário"
            size="md"
            type="text"
            warnText="Warning message that is really long can wrap to more lines but should not be excessively long."
            labelText={""}
          />
        </div>
      </div>
      <div style={{ display: "flex", padding: "8px 38px", gap: "5px", width: "100%" }}>
        <Button size="sm" kind="secondary">Salvar</Button>
        <Button size="sm" kind="secondary">Cancelar</Button>
      </div>
    </div>
  );
}
export default Comment;
