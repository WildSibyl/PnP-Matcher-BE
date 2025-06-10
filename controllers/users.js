import { isValidObjectId } from "mongoose";
import { Types } from "mongoose";
import User from "../models/User.js";
import Group from "../models/Group.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import calculateMatchScore from "../utils/getScore.js";
import { getCoordinates } from "../utils/getCoordinates.js";

//distance magic
function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Erdradius in Metern
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Entfernung in Metern
  return distance;
}

//sorting magic
async function getUsersSorted(users, sortBy, sortOrder) {
  try {
    const sortTheseUsers = [...users];
    const sortedUsers = sortTheseUsers.sort((a, b) => {
      if (!a[sortBy] || !b[sortBy]) return 0;
      return a[sortBy] > b[sortBy] ? sortOrder : -sortOrder;
    });
    return sortedUsers;
  } catch (error) {}
}

export const getAllUsers = async (req, res) => {
  const { radius = 5000 } = req.query;
  //    const userId = req.userId;

  //   try {
  //     // 1. Find the current user
  //     const currentUser = await User.findById(userId);

  //     if (!currentUser || !currentUser.address?.location?.coordinates) {
  //       return res.status(400).json({ error: "User location not available" });
  //     }

  //     const [lng, lat] = currentUser.address.location.coordinates;

  //     // 2. Find nearby users based on the current user's location
  //     const nearbyUsers = await User.find({
  //       _id: { $ne: userId }, // exclude current user from results
  //       "address.location": {
  //         $near: {
  //           $geometry: {
  //             type: "Point",
  //             coordinates: [lng, lat], // current user's coordinates, center of the radius
  //           },
  //           $maxDistance: parseInt(radius), // radius in meters
  //         },
  //       },
  //     });

  //     res.status(200).json(nearbyUsers);
  //   } catch (error) {
  //     console.error("Error fetching users:", error);
  //     res.status(500).json({ error: "Server error" });
  //   }
  try {
    const allUsers = await User.find({
      "address.location": {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [9.993682, 53.551086], //temporary HH coordinates to be exchanged with the one above
          },
          $maxDistance: radius, //in meters
        },
      },
    })
      .populate("avatarUrl")
      .populate("experience")
      .populate("systems")
      .populate("languages")
      .populate("playingRoles")
      .populate("playingModes")
      .populate("playstyles")
      .populate("likes");

    if (!allUsers || allUsers.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json(allUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFilteredUsers = async (req, res) => {
  const {
    search = "",
    systems = [],
    playstyles = [],
    experience = [],
    likes = [],
    dislikes = [],
    radius = 0,
    weekdays = [],
    playingModes = "",
    frequencyPerMonth = 0,
    languages = [],
    age = "",
    sortBy = "userName",
  } = req.body;

  const userId = req.userId;
  const radiusNum = parseInt(req.query.radius) || parseInt(radius);
  console.log("USER ID ", userId);

  //console.log("User ID:", userId);

  try {
    const query = userId ? { _id: { $ne: userId } } : {}; //if there is a user, exclude the current user, else just give back all users
    let currentUser = null;

    //Location is only used for logged in users
    if (userId && radiusNum !== 0) {
      currentUser = await User.findById(userId)
        .populate("experience")
        .populate("systems")
        .populate("languages")
        .populate("playingRoles")
        .populate("playingModes")
        .populate("playstyles")
        .populate("likes")
        .populate("dislikes");
      if (currentUser && currentUser.address?.location?.coordinates) {
        const [lng, lat] = currentUser.address.location.coordinates;
        query["address.location"] = {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [lng, lat], // reversed coordinates for MongoDB
            },
            $maxDistance: radiusNum,
          },
        };
      }
    }

    // Convert string IDs to ObjectId for filters referencing populated fields
    const toObjectIdArray = (arr) =>
      arr.filter(Boolean).map((id) => new Types.ObjectId(id));

    if (search.trim() !== "") {
      query.$or = [
        { userName: { $regex: search, $options: "i" } },
        { tagline: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (systems.length) query.systems = { $in: toObjectIdArray(systems) }; // In operator checks for any mentioned element in the array
    if (playstyles.length)
      query.playstyles = { $in: toObjectIdArray(playstyles) };
    if (experience.length)
      query.experience = { $in: toObjectIdArray(experience) };
    if (likes.length) query.likes = { $in: toObjectIdArray(likes) };
    if (dislikes.length) query.dislikes = { $in: toObjectIdArray(dislikes) };
    if (weekdays.length) query.weekdays = { $in: weekdays };
    if (playingModes) query.playingModes = new Types.ObjectId(playingModes);
    if (frequencyPerMonth > 0)
      query.frequencyPerMonth = { $gte: frequencyPerMonth }; // Greater than or equal to frequency
    if (languages.length) query.languages = { $in: toObjectIdArray(languages) };
    if (age) {
      const today = new Date();
      let minDate, maxDate;

      switch (age) {
        case "Younger than 20":
          minDate = new Date(
            today.getFullYear() - 20,
            today.getMonth(),
            today.getDate()
          );
          query.birthday = { $gte: minDate };
          break;
        case "20 - 30":
          minDate = new Date(
            today.getFullYear() - 30,
            today.getMonth(),
            today.getDate()
          );
          maxDate = new Date(
            today.getFullYear() - 20,
            today.getMonth(),
            today.getDate()
          );
          query.birthday = { $gte: minDate, $lte: maxDate };
          break;
        case "30 - 40":
          minDate = new Date(
            today.getFullYear() - 40,
            today.getMonth(),
            today.getDate()
          );
          maxDate = new Date(
            today.getFullYear() - 30,
            today.getMonth(),
            today.getDate()
          );
          query.birthday = { $gte: minDate, $lte: maxDate };
          break;
        case "40 and older":
          maxDate = new Date(
            today.getFullYear() - 40,
            today.getMonth(),
            today.getDate()
          );
          query.birthday = { $lte: maxDate };
          break;
      }
    }

    // Location (fallback to Hamburg center)
    // query["address.location"] = {
    //   $near: {
    //     $geometry: {
    //       type: "Point",
    //       coordinates: [9.993682, 53.551086], // default center
    //     },
    //     $maxDistance: parseInt(radius),
    //   },
    // };

    const users = await User.find(query)
      .populate("avatarUrl")
      .populate("experience")
      .populate("systems")
      .populate("languages")
      .populate("playingRoles")
      .populate("playingModes")
      .populate("playstyles")
      .populate("likes")
      .populate("dislikes");

    if (!users.length) {
      return res.status(404).json({ message: "No users found" });
    }

    //Calculate and return matchscore for each user
    const userWithScore = users.map((user) => {
      if (currentUser && currentUser.address?.location?.coordinates) {
        const [long1, lat1] = currentUser.address.location.coordinates; //get currUser coordinates
        const [long2, lat2] = user.address.location.coordinates; //get fetched user coordinates

        const distance = getDistanceInMeters(lat1, long1, lat2, long2);

        const matchScore = currentUser
          ? calculateMatchScore(currentUser, user, distance)
          : null;
        return { ...user.toObject(), matchScore, distance };
      } else {
        return {
          ...user.toObject(),
          matchScore: "Not available",
          distance: "Not available",
        };
      }
    });

    //Sort users
    let sortedUsers;
    if (sortBy === "matchScore") {
      sortedUsers = await getUsersSorted(userWithScore, sortBy, -1);
    } else {
      sortedUsers = await getUsersSorted(userWithScore, sortBy, 1);
    }

    //Give back users with matchScore
    res.status(200).json(sortedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getSingleUser = async (req, res) => {
  const {
    params: { id },
  } = req;

  // Mongoose offers a method to check if the id is valid
  if (!isValidObjectId(id)) throw new ErrorResponse("Invalid id", 400);

  const user = await User.findById(id)
    .populate("avatarUrl")
    .populate("experience")
    .populate("systems")
    .populate("languages")
    .populate("playingRoles")
    .populate("playingModes")
    .populate("playstyles")
    .populate("likes")
    .populate("dislikes")
    .populate({
      path: "groups",
      populate: [
        { path: "experience" },
        { path: "systems" },
        { path: "playstyles" },
        { path: "playingModes" },
        { path: "likes" },
      ],
    });

  if (!user)
    throw new ErrorResponse(`User with id of ${id} doesn't exist`, 404);

  res.send(user);
};

export const updateUser = async (req, res) => {
  const {
    params: { id },
    body,
  } = req;

  // Mongoose offers a method to check if the id is valid
  if (!isValidObjectId(id)) throw new ErrorResponse("Invalid id", 400);

  const me = await User.findById(req.userId);
  if (me._id.toString() === id || req.userPermission === "admin") {
    let updatedData = { ...body };

    // If address is present, generate new coordinates
    if (body.address) {
      const { address } = body;

      const { lat, lng } = await getCoordinates(address);

      updatedData.address = {
        ...address,
        location: {
          type: "Point",
          coordinates: [lng, lat], // longitude, latitude
        },
      };
    }

    const user = await User.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!user)
      throw new ErrorResponse(`User with id of ${id} doesn't exist`, 404);

    res.send(user);
  } else {
    throw new ErrorResponse("You are not authorized to update this user", 403);
  }
};

// export const deleteUser = async (req, res) => {
//   const {
//     params: { id },
//   } = req;

//   console.log("Delete user endpoint hit with id:", id);

//   if (!isValidObjectId(id)) throw new ErrorResponse("Invalid id", 400);

//   const me = await User.findById(req.userId);
//   if (!me) throw new ErrorResponse("Unauthorized access", 401);

//   if (me._id.toString() !== id && req.userPermission !== "admin") {
//     throw new ErrorResponse("You are not authorized to delete this user", 403);
//   }

//   const user = await User.findById(id);
//   if (!user) throw new ErrorResponse(`User with id ${id} not found`, 404);

//   try {
//     // Remove user from all groups
//     await Group.updateMany({ members: id }, { $pull: { members: id } });

//     // Find groups authored by the user
//     const authoredGroups = await Group.find({ author: id });
//     const authoredGroupIds = authoredGroups.map((group) => group._id);
//     console.log("Authored group IDs:", authoredGroupIds);

//     // Delete all groups authored by the user
//     await Group.deleteMany({ author: id });

//     // Remove authored group invites from all users
//     if (authoredGroupIds.length > 0) {
//       await User.updateMany(
//         { invites: { $in: authoredGroupIds } },
//         { $pull: { invites: { $in: authoredGroupIds } } }
//       );
//     }

//     // Remove authored groups from all users
//     if (authoredGroupIds.length > 0) {
//       await User.updateMany(
//         { groups: { $in: authoredGroupIds } },
//         { $pull: { groups: { $in: authoredGroupIds } } }
//       );
//     }

//     // Delete the user
//     await User.findByIdAndDelete(id);

//     res.status(200).json({
//       success: `User with ID ${id} and related data was deleted.`,
//     });
//   } catch (error) {
//     console.error("Error during user deletion:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) throw new ErrorResponse("Invalid id", 400);

  const me = await User.findById(req.userId);
  if (!me) throw new ErrorResponse("Unauthorized access", 401);

  if (me._id.toString() !== id && req.userPermission !== "admin") {
    throw new ErrorResponse("You are not authorized to delete this user", 403);
  }

  const user = await User.findById(id);
  if (!user) throw new ErrorResponse(`User with id ${id} not found`, 404);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Remove user from all groups
    await Group.updateMany(
      { members: id },
      { $pull: { members: id } },
      { session }
    );

    // Find groups authored by the user
    const authoredGroups = await Group.find({ author: id }, null, { session });
    const authoredGroupIds = authoredGroups.map((group) => group._id);

    // Delete all groups authored by the user
    await Group.deleteMany({ author: id }, { session });

    // Remove authored group invites from all users
    if (authoredGroupIds.length > 0) {
      await User.updateMany(
        { invites: { $in: authoredGroupIds } },
        { $pull: { invites: { $in: authoredGroupIds } } },
        { session }
      );

      await User.updateMany(
        { groups: { $in: authoredGroupIds } },
        { $pull: { groups: { $in: authoredGroupIds } } },
        { session }
      );
    }

    // Delete the user
    await User.findByIdAndDelete(id, { session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: `User with ID ${id} and related data was deleted.`,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Error during user deletion:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//different endpoint to check username availability, but still in the users controller
export const checkUsernameAvailability = async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const existingUser = await User.findOne({
      userName: { $regex: `^${username}$`, $options: "i" }, // case-insensitive match
    });

    res.json({ isAvailable: !existingUser });
  } catch (err) {
    console.error("Error checking username:", err);
    res.status(500).json({ error: "Server error" });
  }
};

//endpoint to "roll" users for the group. returns x users within 30km with matchscore above 80 (if there are less than 8 results it will take matchscore above 70)
export const getRollMatches = async (req, res) => {
  const { radius = 30000 } = req.query;
  const userId = req.userId;
  let currentUser;

  if (userId) {
    currentUser = await User.findById(userId);
    if (!currentUser || !currentUser.address?.location?.coordinates) {
      return res.status(400).json({ error: "User location not available" });
    }

    try {
      const allUsers = await User.find({
        _id: { $ne: userId },
        "address.location": {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: currentUser.address.location.coordinates || [
                9.993682, 53.551086,
              ],
            },
            $maxDistance: radius, //in meters
          },
        },
      })
        .populate("experience")
        .populate("systems")
        .populate("languages")
        .populate("playingRoles")
        .populate("playingModes")
        .populate("playstyles")
        .populate("likes");

      if (!allUsers || allUsers.length === 0) {
        return res.status(404).json({ message: "No users found" });
      }

      //Calculate and return matchscore for each user
      const userWithScore = allUsers.map((user) => {
        if (currentUser) {
          const [long1, lat1] = currentUser.address.location.coordinates; //get currUser coordinates
          const [long2, lat2] = user.address.location.coordinates; //get fetched user coordinates

          const distance = getDistanceInMeters(lat1, long1, lat2, long2);

          const matchScore = currentUser
            ? calculateMatchScore(currentUser, user, distance)
            : null;
          return { ...user.toObject(), matchScore, distance };
        } else {
          return {
            ...user.toObject(),
            matchScore: "Not available",
            distance: "Not available",
          };
        }
      });

      const matchOver80 = userWithScore.filter((e) => e.matchScore > 80);
      const matchOver70 = userWithScore.filter((e) => e.matchScore > 70);
      const matchOver10 = userWithScore.filter((e) => e.matchScore > 10);
      let randomFour;
      if (matchOver80.length > 4) {
        //give back 4 random users with match score over 80
        const shuffled = matchOver80.sort(() => 0.5 - Math.random());
        randomFour = shuffled.slice(0, 4);
      } else if (matchOver70.length > 4) {
        //give back 4 random users with match score over 70
        const shuffled = matchOver70.sort(() => 0.5 - Math.random());
        randomFour = shuffled.slice(0, 4);
      } else if (matchOver10.length > 3) {
        //give back the 4 users with the highest match score
        const topFour = matchOver10
          .sort((a, b) => b.matchScore - a.matchScore)
          .slice(0, 4);
        randomFour = topFour;
      } else {
        return res.status(404).json({ message: "Not enough users nearby" });
      }

      res.status(200).json(randomFour);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
};

export const inviteToGroup = async (req, res) => {
  const id = req.userId;
  const { invitedUserId, groupId } = req.body;

  // Mongoose offers a method to check if the id is valid
  if (
    !isValidObjectId(id) ||
    !isValidObjectId(invitedUserId) ||
    !isValidObjectId(groupId)
  )
    throw new ErrorResponse("Invalid ids", 400);

  try {
    const group = await Group.findById(groupId);
    const me = await User.findById(id);

    if (!me)
      throw new ErrorResponse(`User with id of ${id} doesn't exist`, 404);

    if (!group) {
      throw new ErrorResponse("Group not found", 404);
    }

    //is user author of the group?
    const isAuthor = group.author.toString() === id;
    if (!isAuthor) {
      throw new ErrorResponse("Only group admins can invite users", 400);
    }

    const invitedUser = await User.findById(invitedUserId);
    if (!invitedUser) {
      throw new ErrorResponse("User not found", 400);
    }

    //Check if already invited
    if (!Array.isArray(invitedUser.invites)) {
      invitedUser.invites = [];
    }

    if (invitedUser.invites.includes(groupId)) {
      throw new ErrorResponse("User already invited to this group", 400);
    }

    //Check if already part of the group
    if (invitedUser.groups.includes(groupId)) {
      throw new ErrorResponse("User already part of that group", 400);
    }

    //add invite to user model
    invitedUser.invites.push(groupId);
    await invitedUser.save();

    res.status(200).json({
      message: "User successfully invited to group",
      invites: invitedUser.invites,
    });
  } catch (error) {
    console.error("Error inviting user:", error);
    const status = error.statusCode || 500;
    throw new ErrorResponse(`Error inviting user: ${error}`, status);
  }
};

export const addToGroup = async (req, res) => {
  const id = req.userId;
  const { groupId } = req.body;

  // Mongoose offers a method to check if the id is valid
  if (!isValidObjectId(id) || !isValidObjectId(groupId))
    throw new ErrorResponse("Invalid ids", 400);

  try {
    const group = await Group.findById(groupId);
    const me = await User.findById(id);

    if (!me)
      throw new ErrorResponse(`User with id of ${id} doesn't exist`, 404);

    if (!group) {
      throw new ErrorResponse("Group not found", 404);
    }

    //Check if already part of the group
    if (me.groups.includes(groupId)) {
      throw new ErrorResponse("User already part of that group", 400);
    }

    //Check if invited
    if (!Array.isArray(me.invites)) {
      me.invites = [];
    }
    if (!me.invites.includes(groupId)) {
      throw new ErrorResponse("User not invited to this group", 400);
    }

    //add user to group
    me.groups.push(groupId);
    group.members.push(id);
    //remove invite
    me.invites = me.invites.filter(
      (id) => id.toString() !== groupId.toString()
    );

    await me.save();
    await group.save();

    res.status(200).json({
      message: "User joined group successfully",
      group: group,
    });
  } catch (error) {
    console.error("Error joining the group", error);
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "Server error" });
  }
};

export const removeInvite = async (req, res) => {
  const id = req.userId;
  const { groupId } = req.body;

  if (!isValidObjectId(id) || !isValidObjectId(groupId))
    throw new ErrorResponse("Invalid ids", 400);

  try {
    const group = await Group.findById(groupId);
    const me = await User.findById(id);

    if (!me)
      throw new ErrorResponse(`User with id of ${id} doesn't exist`, 404);

    if (!group) {
      throw new ErrorResponse("Group not found", 404);
    }

    //Check if invited
    if (!Array.isArray(me.invites)) {
      me.invites = [];
    }
    if (!me.invites.includes(groupId)) {
      throw new ErrorResponse("User not invited to this group", 400);
    }

    //remove invite
    me.invites = me.invites.filter(
      (id) => id.toString() !== groupId.toString()
    );

    await me.save();

    res.status(200).json({
      message: "Invite declined successfully",
      user: me,
    });
  } catch (error) {
    console.error("Error declining the invite", error);
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "Server error" });
  }
};

export const removeFromGroup = async (req, res) => {
  const id = req.userId;
  const { groupId } = req.body;

  if (!isValidObjectId(id) || !isValidObjectId(groupId))
    throw new ErrorResponse("Invalid ids", 400);

  try {
    const group = await Group.findById(groupId);
    const me = await User.findById(id);

    if (!me)
      throw new ErrorResponse(`User with id of ${id} doesn't exist`, 404);

    if (!group) {
      throw new ErrorResponse("Group not found", 404);
    }

    if (!me.groups.includes(groupId)) {
      throw new ErrorResponse("Not a member of the group", 400);
    }

    //remove user from group
    me.groups = me.groups.filter((id) => id.toString() !== groupId.toString());
    group.members = group.members.filter(
      (member) => member.toString() !== id.toString()
    );
    await me.save();
    await group.save();

    res.status(200).json({
      message: "User has left the group",
      group: group,
    });
  } catch (error) {
    console.error("Error removing the user from the group", error);
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "Server error" });
  }
};

export const getAuthoredGroups = async (req, res) => {
  try {
    const userId = req.userId;
    const groups = await Group.find({ author: userId });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: "Error loading groups" });
  }
};

export const getYourGroups = async (req, res) => {
  try {
    const userId = req.userId;

    if (!isValidObjectId(userId)) {
      throw new ErrorResponse("Not a valid object id", 404);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorResponse("User not found", 404);
    }
    const groups = await Group.find({ _id: { $in: user.groups } })
      .populate("author")
      .populate("experience")
      .populate("playingModes")
      .populate("playstyles")
      .populate("likes")
      .populate("dislikes")
      .populate("members")
      .populate("systems");

    res.json(groups);
  } catch (error) {
    throw new ErrorResponse(`Error loading groups: ${error}`, 500);
  }
};
