import { isValidObjectId } from "mongoose";
import { Types } from "mongoose";
import Group from "../models/Group.js";
import User from "../models/User.js";
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
async function getGroupsSorted(users, sortBy, sortOrder) {
  try {
    let grpSortBy = null;
    if (sortBy === "userName") {
      grpSortBy = "name";
    } else {
      grpSortBy = sortBy;
    }
    const sortTheseUsers = [...users];
    const sortedUsers = sortTheseUsers.sort((a, b) => {
      if (!a[grpSortBy] || !b[grpSortBy]) return 0;
      return a[grpSortBy] > b[grpSortBy] ? sortOrder : -sortOrder;
    });
    return sortedUsers;
  } catch (error) {}
}

export const getAllGroups = async (req, res) => {
  const groups = await Group.find().populate("author");
  res.json(groups);
};

export const createGroup = async (req, res) => {
  const { body } = req;
  console.log(req.userId);

  const user = await User.findById(req.userId);
  if (!user) throw new ErrorResponse("User doesn't exist", 404);

  // Safely extract and transform coordinates
  const { address } = body;

  const { lat, lng } = await getCoordinates(address);

  let image;
  if (!body.image) {
    image = "https://i.imgur.com/A72K4gz.jpeg";
  } else {
    image = body.image;
  }

  const newGroup = await Group.create({
    ...body,
    author: req.userId,
    image,
    address: {
      ...address,
      location: {
        coordinates: [lng, lat], //Always longitude first and then latitude
      },
    },
  });

  // Add group to user's list of groups
  await User.findByIdAndUpdate(req.userId, {
    $push: { groups: newGroup._id },
  });

  // Populate after creation
  const populatedGroup = await Group.findById(newGroup._id).populate("author");

  res.status(201).json(populatedGroup);
};

export const getSingleGroup = async (req, res) => {
  const {
    params: { id },
  } = req;

  if (!isValidObjectId(id)) throw new ErrorResponse("Invalid id", 400);

  const group = await Group.findById(id)
    .populate({
      path: "author",
      populate: [
        { path: "experience" },
        { path: "systems" },
        { path: "playstyles" },
        { path: "playingModes" },
        { path: "likes" },
        { path: "playingRoles" },
      ],
    })
    .populate("experience")
    .populate("playingModes")
    .populate("playstyles")
    .populate("likes")
    .populate("dislikes")
    .populate({
      path: "members",
      populate: [
        { path: "experience" },
        { path: "systems" },
        { path: "playstyles" },
        { path: "playingModes" },
        { path: "likes" },
        { path: "playingRoles" },
      ],
    })
    .populate("systems");
  if (!group)
    throw new ErrorResponse(`Group with id of ${id} doesn't exist`, 404);

  res.send(group);
};

export const updateGroup = async (req, res) => {
  const {
    body,
    params: { id },
  } = req;

  if (!isValidObjectId(id)) throw new ErrorResponse("Invalid id", 400);

  const group = await Group.findById(id);
  if (!group)
    throw new ErrorResponse(`Group with id of ${id} doesn't exist`, 404);

  if (
    group.author.toString() === req.userId ||
    req.userPermission === "admin"
  ) {
    let updatedData = { ...body };

    // If address is being updated, regenerate coordinates
    if (body.address) {
      const { address } = body;

      const { lat, lng } = await getCoordinates(address);

      updatedData.address = {
        ...address,
        location: {
          type: "Point",
          coordinates: [lng, lat], // Longitude first!
        },
      };
    }

    const updatedGroup = await Group.findByIdAndUpdate(id, updatedData, {
      new: true,
    }).populate("author");
    if (!updatedGroup)
      throw new ErrorResponse(`Group with id of ${id} doesn't exist`, 404);

    res.json(updatedGroup);
  } else {
    throw new ErrorResponse("You are not authorized to update this group", 403);
  }
};

export const deleteGroup = async (req, res) => {
  const {
    params: { id },
  } = req;

  if (!isValidObjectId(id)) throw new ErrorResponse("Invalid id", 400);

  const group = await Group.findById(id);
  if (!group)
    throw new ErrorResponse(`Group with id of ${id} doesn't exist`, 404);

  if (
    group.author.toString() === req.userId ||
    req.userPermission === "admin"
  ) {
    const deletedGroup = await Group.findByIdAndDelete(id).populate("author");
    if (!deletedGroup) throw new Error(`Group with id of ${id} doesn't exist`);

    res.json({ success: `Group with id of ${id} was deleted` });
  } else {
    throw new ErrorResponse("You are not authorized to delete this group", 403);
  }
};

export const checkGroupnameAvailability = async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: "Group name is required" });
  }

  try {
    const existingGroup = await Group.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
    });

    res.json({ isAvailable: !existingGroup });
  } catch (err) {
    console.error("Error checking group name:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getFilteredGroups = async (req, res) => {
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
  let currentUser;

  try {
    const query = {};
    if (userId) {
      currentUser = await User.findById(userId);

      if (!currentUser) {
        throw new ErrorResponse("User not found", 404);
      }
    }

    //User groups or empty array (if no user is logged in)
    const userGroupIds = currentUser?.groups || [];

    //filter groups out if they have the user as member or if they are in the groups list
    query._id = { $nin: userGroupIds };
    query.members = { $ne: userId };

    if (radiusNum !== 0 && currentUser?.address?.location?.coordinates) {
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

    // Convert string IDs to ObjectId for filters referencing populated fields
    const toObjectIdArray = (arr) =>
      arr.filter(Boolean).map((id) => new Types.ObjectId(id));

    if (search.trim() !== "") {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { tagline: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (systems.length) query.systems = { $in: toObjectIdArray(systems) };
    if (playstyles.length)
      query.playstyles = { $in: toObjectIdArray(playstyles) };
    if (experience.length)
      query.experience = { $in: toObjectIdArray(experience) };
    if (likes.length) query.likes = { $in: toObjectIdArray(likes) };
    if (dislikes.length) query.dislikes = { $in: toObjectIdArray(dislikes) };
    if (weekdays.length) query.weekdays = { $in: weekdays };
    if (playingModes) query.playingModes = new Types.ObjectId(playingModes);
    if (frequencyPerMonth > 0)
      query.frequencyPerMonth = { $gte: frequencyPerMonth };
    if (languages.length) query.languages = { $in: toObjectIdArray(languages) };

    const groups = await Group.find(query)
      .populate("experience")
      .populate("systems")
      .populate("languages")
      .populate("playingModes")
      .populate("playstyles")
      .populate("likes")
      .populate("dislikes");

    if (!groups.length) {
      return res.status(404).json({ message: "No groups found" });
    }

    console.log(groups);

    //CalculateMatchScore
    const groupsWithScore = groups.map((group) => {
      if (currentUser && currentUser.address?.location?.coordinates) {
        const userCoords = currentUser.address?.location?.coordinates;
        const groupCoords = group.address?.location?.coordinates;

        let distance = null;
        let matchScore = null;

        if (
          Array.isArray(userCoords) &&
          userCoords.length === 2 &&
          Array.isArray(groupCoords) &&
          groupCoords.length === 2
        ) {
          const [long1, lat1] = userCoords;
          const [long2, lat2] = groupCoords;

          distance = getDistanceInMeters(lat1, long1, lat2, long2);

          matchScore = calculateMatchScore(currentUser, group, distance);
        }

        return {
          ...group.toObject(),
          matchScore: matchScore ?? "Not available",
          distance: distance ?? "Not available",
        };
      } else {
        return {
          ...group.toObject(),
          matchScore: "Not available",
          distance: "Not available",
        };
      }
    });

    //Sort groups
    let sortedGroups;
    if (sortBy === "matchScore") {
      sortedGroups = await getGroupsSorted(groupsWithScore, sortBy, -1);
    } else {
      sortedGroups = await getGroupsSorted(groupsWithScore, sortBy, 1);
    }

    res.status(200).json(sortedGroups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    throw new ErrorResponse(`Error fetching groups ${error}`, 500);
  }
};
