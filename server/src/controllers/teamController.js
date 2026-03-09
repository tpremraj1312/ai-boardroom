import Team from '../models/Team.js';
import User from '../models/User.js';

export const createTeam = async (req, res, next) => {
    try {
        const { name } = req.body;
        const team = await Team.create({
            name,
            owner: req.user._id,
            members: [{ user: req.user._id, role: 'owner' }]
        });

        // Update user to link team
        await User.findByIdAndUpdate(req.user._id, { teamId: team._id });

        res.status(201).json(team);
    } catch (error) {
        next(error);
    }
};

export const getMyTeam = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user.teamId) {
            return res.status(404).json({ message: 'User does not belong to a team' });
        }

        const team = await Team.findById(user.teamId).populate('members.user', 'name email role');
        if (!team) return res.status(404).json({ message: 'Team not found' });

        res.json(team);
    } catch (error) {
        next(error);
    }
};

export const inviteMember = async (req, res, next) => {
    try {
        const { email, role } = req.body;
        const user = await User.findById(req.user._id);

        if (!user.teamId) return res.status(400).json({ message: 'You must create a team first' });

        const team = await Team.findById(user.teamId);

        // Check if requester is owner
        if (team.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only team owner can invite members' });
        }

        // Basic invite token generation
        const token = Math.random().toString(36).substring(2, 15);
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        team.invites.push({ email, role: role || 'viewer', token, expiresAt });
        await team.save();

        res.status(200).json({ message: 'Invite created (email simulation)', token });
    } catch (error) {
        next(error);
    }
};
