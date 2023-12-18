/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const IndefiniteVirtualScroll = ({
  list = [],
  containerHeight = 800,
  estimatedItemHeight = 90,
  ItemBox = <></>,
  ...props
}: any) => {
  const [startIndex, setStartIndex] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);

  // 初始化缓存数组
  // 先给没有渲染出来的列表项设置一个预估高度，等到这些数据渲染成真实dom元素了之后，再获取到他们的真实高度去更新原来设置的预估高度
  // 高度尽量往小范围设置，避免出现空白
  const [positionCache, setPositionCache] = useState(() => {
    return list.map((item, i) => {
      return {
        index: i,
        height: estimatedItemHeight,
        top: i * estimatedItemHeight,
        bottom: (i + 1) * estimatedItemHeight,
      };
    });
  });
  // 根据缓存数组的高度，来设置展示条数
  const limit = useMemo(() => {
    let i = 0,
      sum = 0;
    for (; i < positionCache.length; i++) {
      sum += positionCache[i].height;
      if (sum >= containerHeight) break;
    }
    return i;
  }, [positionCache]);

  // 列表高度，用于撑开滚动条
  const wrapperHeight = useMemo(() => {
    let len = positionCache.length;
    if (len !== 0) {
      return positionCache[len - 1].bottom;
    } else {
      return list.length * estimatedItemHeight;
    }
  }, [list, positionCache, estimatedItemHeight]);

  // 结束条数的索引
  const endIndex = useMemo(() => {
    return Math.min(startIndex + limit, list.length - 1);
  }, [startIndex, limit]);

  useEffect(() => {
    // 获取当前视口中的列表节点
    const nodeList = (wrapperRef.current as any).childNodes;
    const posiList = [...positionCache];
    let update = false;
    nodeList.forEach((node: any) => {
      const newHeight = node.clientHeight;
      const id = Number(node.id.split("-")[1]);
      const oldHeight = posiList[id].height;
      const dHeight = oldHeight - newHeight;
      if (dHeight) {
        update = true;
        posiList[id].height = newHeight;
        // 当前节点与底部的距离 = 上一个节点与底部的距离 + 当前节点的高度
        posiList[id].bottom =
          id > 0
            ? posiList[id - 1].bottom + posiList[id].height
            : posiList[id].height;
        posiList[id].top = id > 0 ? posiList[id - 1].bottom : 0;
        // 更改一个节点就需要更改之后所有的值，不然会造成空白
        for (let j = id + 1; j < posiList.length; j++) {
          posiList[j].bottom += dHeight;
          posiList[j].top = posiList[j - 1].bottom;
        }
      }
    });
    // 相同节点不更新数组
    if (update) {
      setPositionCache(posiList);
    }
  }, [scrollTop]);

  const handleScroll = useCallback(
    (e) => {
      if (e.target !== containerRef.current) return;
      const scrollTop = e.target.scrollTop;
      setScrollTop(scrollTop);
      // 根据当前偏移量，获取当前最上方的元素
      // 因为滚轮一开始一定是往下的，所以上方的元素高度与顶部和底部的距离等都是被缓存的
      const currentStartIndex = getStartIndex(scrollTop);
      if (currentStartIndex !== startIndex) {
        setStartIndex(currentStartIndex);
      }
    },
    [estimatedItemHeight, startIndex, containerRef]
  );
  // 使用translate来校正滚动条位置
  // 也可以使用paddingTop来实现，目的是将子节点准确放入视口中
  const getTransform = useCallback(() => {
    return {
      // 改变空白填充区域的样式，起始元素的top值就代表起始元素距顶部的距离，可以用来充当paddingTop值
      paddingTop: positionCache[startIndex].top + "px",
      // 缓存中最后一个元素的bottom值与endIndex对应元素的bottom值的差值可以用来充当paddingBottom的值
      paddingBottom: `${
        positionCache[positionCache.length - 1].bottom -
        positionCache[endIndex].bottom
      }px`,
    };
  }, [startIndex, positionCache]);

  const compareResult = {
    eq: 1,
    lt: 2,
    gt: 3,
  };

  const getStartIndex = (scrollTop: number) => {
    let idx =
      binarySearch(positionCache, scrollTop, (currentCalue, targetValue) => {
        const currentCompareValue = currentCalue.bottom;
        if (currentCompareValue === targetValue) {
          return compareResult.eq;
        } else if (currentCompareValue < targetValue) {
          return compareResult.lt;
        } else {
          return compareResult.gt;
        }
      }) || 0;
    if (positionCache[idx].bottom < scrollTop) {
      idx += 1;
    }
    return idx;
  };
  const binarySearch = (list, value, compareFunc) => {
    let start = 0;
    let end = list.length - 1;
    let middle = 0;
    while (start <= end) {
      middle = Math.floor((end + start) / 2);
      const middleValue = list[middle];
      const comopareRes = compareFunc(middleValue, value);
      if (comopareRes === compareResult.eq) {
        return middle;
      } else if (comopareRes === compareResult.lt) {
        start = middle + 1;
      } else {
        end = middle - 1;
      }
    }
    return middle;
  };

  const renderList = useCallback(() => {
    const rows: any = [];
    for (let i = startIndex; i <= endIndex; i++) {
      rows.push(
        <ItemBox
          data={list[i]}
          index={i}
          key={i}
          style={{
            width: "100%",
            borderBottom: "1px solid #aaa",
          }}
        />
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
        <div style={getTransform()} ref={wrapperRef}>
          {renderList()}
        </div>
      </div>
    </div>
  );
};

export default IndefiniteVirtualScroll;
