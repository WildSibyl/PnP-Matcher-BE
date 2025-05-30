const calculateMatchScore = (userA, userB, distance) => {
  let score = 0;
  const medFilter = 1; //multiplicator for category
  const hiFilter = 2; //multiplicator for category
  const deductFilter = 3; //points that will be deducted for each like/dislike clash
  const maxDeduct = 20; //max point that will be deducted in the like/dislike check
  const pointGoal = 20; // if the users have this much matches they get full match 99%

  const scoreRatio = (aList = [], bList = [], weight) => {
    const unique = new Set([...aList, ...bList]).size; //Get number of unique values from user A AND B
    const bSet = new Set([...bList]); //create a set from B for easier and faster searchability
    const shared = aList.filter((item) => bSet.has(item)).length; //check number of matching values between A and B

    return Math.min(10, shared * weight); //each match gives one point up to the maximum per category
  };

  //Game Systems Check
  const systemsScore = scoreRatio(userA.systems, userB.systems, medFilter);

  //Likes check
  const likesScore = scoreRatio(userA.likes, userB.likes, hiFilter);

  //Dislikes check
  const dislikesScore = scoreRatio(userA.dislikes, userB.dislikes, medFilter);

  // Weekdays check
  const weekdaysScore = scoreRatio(userA.weekdays, userB.weekdays, hiFilter);

  // Playstyles check
  const playstylesScore = scoreRatio(
    userA.playstyles,
    userB.playstyles,
    medFilter
  );

  //Check Radius
  let distanceScore;
  if (distance < 10000) {
    distanceScore = 9;
  } else if (distance < 15000) {
    distanceScore = 6;
  } else if (distance < 30000) {
    distanceScore = 3;
  } else {
    distanceScore = 0;
  }

  //Negative check (See if userB disliked something that userA likes)
  const bDislikeSet = new Set(userB.dislikes);
  const dislikeClashes = userA.likes.filter((item) =>
    bDislikeSet.has(item)
  ).length;
  const clashScore = Math.min(dislikeClashes * deductFilter, maxDeduct); //deduct points for each likes/dislikes clashes

  score =
    systemsScore +
    likesScore +
    dislikesScore +
    playstylesScore +
    weekdaysScore +
    distanceScore -
    clashScore;

  const finalScore = Math.round((100 / pointGoal) * score);

  //LOG ALL VALUES
  console.log({
    systems: systemsScore,
    likes: likesScore,
    dislikes: dislikesScore,
    weekdays: weekdaysScore,
    playstyles: playstylesScore,
    distance: distanceScore,
    clashScore: clashScore,
    totalScore: score,
    finalScore: finalScore,
  });

  return Math.max(1, Math.min(finalScore, 99));
};

export default calculateMatchScore;

// //OLD VERSION GIVING A POINT FOR EACH MATCH
//  let score = 0;
//   const minScore = 1;
//   const maxScore = 99;
//   const medFilter = 15; //max points for a filter with medium weight
//   const hiFilter = 20; //max points for a filter with high weight
//   const deductFilter = 3; //points that will be deducted for each like/dislike clash
//   const maxDeduct = 25; //max point that will be deducted in the like/dislike check

//   const scoreRatio = (aList = [], bList = [], weight) => {
//     const unique = new Set([...aList, ...bList]).size; //Get number of unique values from user A AND B
//     const bSet = new Set([...bList]); //create a set from B for easier and faster searchability
//     const shared = aList.filter((item) => bSet.has(item)).length; //check number of matching values between A and B

//     //THIS OLD VARIATION ALSO COUNTS IN THE NUMBER OF TOTAL BADGES IN THE PROFILE. It caused low score values
//     // const ratio = unique === 0 ? 0 : shared / unique; //How many of the total values in their profiles are shared? Returns value between 0 and 1
//     // return Math.round(ratio * weight); //Set max points to get out of this category according to weight
//     // return Math.min(shared, weight); //each match gives one point up to the maximum per category

//   };

//   //Game Systems Check
//   score += scoreRatio(userA.systems, userB.systems, medFilter);

//   //Likes check
//   score += scoreRatio(userA.likes, userB.likes, hiFilter);

//   //Dislikes check
//   score += scoreRatio(userA.dislikes, userB.dislikes, medFilter);

//   // Weekdays check
//   score += scoreRatio(userA.weekdays, userB.weekdays, hiFilter);

//   // Playstyles check
//   score += scoreRatio(userA.playstyles, userB.playstyles, medFilter);

//   //Negative check (See if userB disliked something that userA likes)
//   const bDislikeSet = new Set(userB.dislikes);
//   const dislikeClashes = userA.likes.filter((item) =>
//     bDislikeSet.has(item)
//   ).length;
//   score -= Math.min(dislikeClashes * deductFilter, maxDeduct); //deduct points for each likes/dislikes clashes

//   //Check Radius
//   if (distance < 10000) {
//     score += 15;
//   } else if (distance < 15000) {
//     score += 10;
//   } else if (distance < 30000) {
//     score += 5;
//   } else {
//     score += 0;
//   }

//   //Normalize score, so that it's minimum 0 and maximum 99
//   const normalizedScore = Math.max(minScore, Math.min(score, maxScore));

//   //Push score, to have uses between 20-99
//   const scaled = Math.round(
//     ((normalizedScore - 10) / (99 - 10)) * (99 - 20) + 20
//   );

//   return Math.min(scaled, 99);

/////////////////

// Variation getting a percentage from each matching category

//  let score = 0;
//   const minScore = 1;
//   const maxScore = 99;
//   const medFilter = 5; //max points for a filter with medium weight
//   const hiFilter = 2; //max points for a filter with high weight
//   const deductFilter = 3; //points that will be deducted for each like/dislike clash
//   const maxDeduct = 25; //max point that will be deducted in the like/dislike check

//   const scoreRatio = (aList = [], bList = [], weight) => {
//     const unique = new Set([...aList, ...bList]).size; //Get number of unique values from user A AND B
//     const bSet = new Set([...bList]); //create a set from B for easier and faster searchability
//     const shared = aList.filter((item) => bSet.has(item)).length; //check number of matching values between A and B

//     //each category will give back a score between 0-100
//     const score = shared * (100 / weight);
//     return Math.min(score, 100);
//   };

//   //Game Systems Check
//   const systemsRatio = scoreRatio(userA.systems, userB.systems, medFilter);

//   //Likes check
//   const likesRatio = scoreRatio(userA.likes, userB.likes, hiFilter);

//   //Dislikes check
//   const dislikesRatio = scoreRatio(userA.dislikes, userB.dislikes, medFilter);

//   // Weekdays check
//   const weekdaysRatio = scoreRatio(userA.weekdays, userB.weekdays, hiFilter);

//   // Playstyles check
//   const playstylesRatio = scoreRatio(
//     userA.playstyles,
//     userB.playstyles,
//     medFilter
//   );

//   //Negative check (See if userB disliked something that userA likes)
//   const bDislikeSet = new Set(userB.dislikes);
//   const dislikeClashes = userA.likes.filter((item) =>
//     bDislikeSet.has(item)
//   ).length;
//   const clashScore = Math.min((100 / hiFilter) * dislikeClashes, 100);

//   //Check Radius
//   let radiusRatio = 0;
//   if (distance < 10000) {
//     radiusRatio = 100;
//   } else if (distance < 15000) {
//     radiusRatio = 85;
//   } else if (distance < 30000) {
//     radiusRatio = 70;
//   } else if (distance < 45000) {
//     radiusRatio = 55;
//   } else if (distance < 60000) {
//     radiusRatio = 40;
//   } else {
//     radiusRatio = 25;
//   }

//   // Summe of positive scores
//   const positiveScores = [
//     systemsRatio,
//     likesRatio,
//     dislikesRatio,
//     weekdaysRatio,
//     playstylesRatio,
//     radiusRatio,
//   ];
//   console.log(positiveScores);

//   // Average of positive scores
//   const averagePositive =
//     positiveScores.reduce((a, b) => a + b, 0) / positiveScores.length;

//   // Deduction from dislikeClash
//   const finalScore = averagePositive - clashScore;

//   // Make sure final score is between 1 and 99
//   const boundedScore = Math.min(Math.max(finalScore, 1), 99);

//   return Math.round(boundedScore);
