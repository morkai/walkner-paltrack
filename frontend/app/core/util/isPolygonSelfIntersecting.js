// Part of <https://github.com/Vodek2/intersecting-polygon-detector/> licensed under <MIT>

define([], function()
{
  'use strict';

  function isPointWithinSegment(point, segment)
  {
    const [xPoint, yPoint] = point;
    const [[xSegmentStart, ySegmentStart], [xSegmentEnd, ySegmentEnd]] = segment;
    const maxX = Math.max(xSegmentStart, xSegmentEnd);
    const maxY = Math.max(ySegmentStart, ySegmentEnd);
    const minX = Math.min(xSegmentStart, xSegmentEnd);
    const minY = Math.min(ySegmentStart, ySegmentEnd);
    const isWithinXRange = xPoint >= minX && xPoint <= maxX;
    const isWithinYRange = yPoint >= minY && yPoint <= maxY;

    return isWithinXRange && isWithinYRange;
  }

  function isPointPartOfBothSegments(point, segment1, segment2)
  {
    const pointInSegment1 = isPointWithinSegment(point, segment1);
    const pointInSegment2 = isPointWithinSegment(point, segment2);

    return pointInSegment1 && pointInSegment2;
  }

  function areLinesIntersect(segment1, segment2)
  {
    const [
      [xSegment1Start, ySegment1Start],
      [xSegment1End, ySegment1End]
    ] = segment1;
    const [
      [xSegment2Start, ySegment2Start],
      [xSegment2End, ySegment2End]
    ] = segment2;

    const A1 = ySegment1End - ySegment1Start;
    const B1 = xSegment1Start - xSegment1End;
    const C1 = A1 * xSegment1Start + B1 * ySegment1Start;

    const A2 = ySegment2End - ySegment2Start;
    const B2 = xSegment2Start - xSegment2End;
    const C2 = A2 * xSegment2Start + B2 * ySegment2Start;

    const denominator = A1 * B2 - A2 * B1;
    const numeratorX = B2 * C1 - B1 * C2;
    const numeratorY = A1 * C2 - A2 * C1;
    const XNumerator = numeratorX === 0 || numeratorX === -0 ? 0 : numeratorX;
    const YNumerator = numeratorY === 0 || numeratorY === -0 ? 0 : numeratorY;
    const X = XNumerator / denominator === 0 ? 0 : XNumerator / denominator;
    const Y = YNumerator / denominator === 0 ? 0 : YNumerator / denominator;

    // possible intersection for 2 lines which includes segments
    const possibleIntersection = denominator !== 0 ? [X, Y] : [0, 0];
    // check if intersection is part of both segments
    const ret = isPointPartOfBothSegments(
      possibleIntersection,
      segment1,
      segment2
    );

    return ret;
  }

  function getAllSegmentsButIndexAndNeighbors(currentIndex, arrayOfSegments)
  {
    if (currentIndex >= arrayOfSegments.length || currentIndex < 0)
    {
      throw new Error('Invalid current index');
    }

    let nextIndex = currentIndex + 1;
    let previousIndex = currentIndex - 1;

    if (currentIndex === arrayOfSegments.length - 1)
    {
      nextIndex = 0;
    }

    if (currentIndex === 0)
    {
      previousIndex = arrayOfSegments.length - 1;
    }

    const segments = arrayOfSegments.filter((segment, index) =>
    {
      return (
        index !== currentIndex && index !== nextIndex && index !== previousIndex
      );
    });

    return segments;
  }

  // group polygon coordinate points into segments [[[x.y],[x,y]],.....]
  function createSegments(polygon)
  {
    const arrOfSegments = [];

    for (let i = 0; i < polygon.length - 1; i++)
    {
      const segment = [polygon[i], polygon[i + 1]];

      arrOfSegments.push(segment);
    }

    return arrOfSegments;
  }

  return function isPolygonSelfIntersecting(polygon, connectLast = false)
  {
    if (connectLast)
    {
      polygon = polygon.concat([polygon[0]]);
    }

    const segments = createSegments(polygon);

    let lineIntersect = false;

    outer: for (let i = 0; i < segments.length; i++)
    {
      const current = segments[i];
      const otherSegments = getAllSegmentsButIndexAndNeighbors(i, segments);

      for (let j = 0; j < otherSegments.length; j++)
      {
        lineIntersect = areLinesIntersect(current, otherSegments[j]);

        if (lineIntersect)
        {
          break outer;
        }
      }
    }

    return lineIntersect;
  };
});
