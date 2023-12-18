/* eslint-disable react-hooks/exhaustive-deps */
import React, { memo, useCallback, useMemo, useRef, useState } from "react";

const FixedVirtualScroll = ({
  list = [],
  containerHeight = 800,
  itemHeight = 50,
  ItemBox = <></>,
  ...props
}: any) => {
  const containerRef = useRef(null);

  const [startIndex, setStartIndex] = useState(0);

  // 用于撑开Container的盒子，计算其高度
  const wrapperHeight = useMemo(() => {
    return itemHeight * list.length;
  }, [list, itemHeight]);
  // 可视区域最多显示的条数
  const limit = useMemo(() => {
    return Math.ceil(containerHeight / itemHeight);
  }, [startIndex]);
  // 当前可视区域显示的列表的结束索引
  const endIndex = useMemo(() => {
    return Math.min(startIndex + limit, list.length - 1);
  }, [startIndex, limit]);
  //核心方法
  const handleScroll = useCallback(
    (e) => {
      if (e.target !== containerRef.current) return; //过滤其他页面滚动
      const scrollTop = e.target.scrollTop;
      const currentIndex = Math.floor(scrollTop / itemHeight);
      if (currentIndex !== startIndex) {
        setStartIndex(currentIndex);
      }
    },
    [containerRef, itemHeight, startIndex]
  );

  const renderList = useCallback(() => {
    const rows: any = [];
    for (let i = startIndex; i <= endIndex + 1; i++) {
      rows.push(
        <ItemBox
          data={i}
          key={i}
          style={{
            width: "100%",
            height: itemHeight - 11 + "px",
            position: "absolute",
            top: i * itemHeight + "px",
            left: 0,
            right: 0,
            marginTop: "10px",
            borderBottom: "1px solid #ccc",
            backgroundColor: "orange",
          }}
        >
          {i}
        </ItemBox>
      );
    }
    return rows;
  }, [startIndex, endIndex, ItemBox]);

  return (
    <div
      style={{ overflowY: "auto", height: containerHeight + "px" }}
      ref={containerRef}
      onScroll={handleScroll}
    >
      <div style={{ position: "relative", height: wrapperHeight + "px" }}>
        {renderList()}
      </div>
    </div>
  );
};

export default memo(FixedVirtualScroll);
