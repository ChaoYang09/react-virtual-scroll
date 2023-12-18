import React, { memo, useState } from "react";
import IndefiniteVirtualScroll from "./index.tsx";
const TestVirtual2 = () => {
  const [items] = useState(new Array(300).fill(1));
  const ItemBox = memo(({ data = "", index = 0, style = 0 }: any) => {
    let content = "";
    // 模拟不同高度
    if (index % 2 === 0) content = "AAAAAAAAA";
    else if (index % 3 === 0)
      content =
        "gquwgdjafbejbjf enbdgjkwelhnfkwjeqnfks nwkqjnfs fmenq gfjkwnqfkjgquwgdjafbejbjf enbdgjkwelhnfkwjeqnfks nwkqjnfs fmenq gfjkwnqfkjgquwgdjafbejbjf enbdgjkwelhnfkwjeqnfks nwkqjnfs fmenq gfjkwnqfkjgquwgdjafbejbjf enbdgjkwelhnfkwjeqnfks nwkqjnfs fmenq gfjkwnqfkj";
    else
      content =
        "gquwgdjafbejbjf enbdgjkwelhnfkwjeqnfks nwkqjnfs fmenq gfjkwnqfkj";
    return (
      <div style={style} id={`item-${index}`}>
        {index}-----------{content}
      </div>
    );
  });

  return (
    <div
      className={"container"}
      style={{
        width: "600px",
        margin: "auto",
        marginTop: "100px",
        padding: "15px",
        border: "1px solid black",
      }}
    >
      <IndefiniteVirtualScroll
        list={items}
        containerHeight={500}
        ItemBox={ItemBox}
      />
    </div>
  );
};

export default TestVirtual2;
