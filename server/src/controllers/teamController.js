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

        res.status(201).json({ team });
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

        res.status(200).json({ message: 'Invite created (email simulation)', token, inviteToken: token });
    } catch (error) {
        next(error);
    }
};

export const acceptInvite = async (req, res, next) => {
    try {
        const { token } = req.params;
        const user = await User.findById(req.user._id);

        if (user.teamId) {
            return res.status(400).json({ message: 'You are already in a team' });
        }

        const team = await Team.findOne({ 'invites.token': token });
        if (!team) return res.status(404).json({ message: 'Invalid or expired invite token' });

        const inviteIndex = team.invites.findIndex(i => i.token === token);
        const invite = team.invites[inviteIndex];

        if (new Date() > new Date(invite.expiresAt)) {
            team.invites.splice(inviteIndex, 1);
            await team.save();
            return res.status(400).json({ message: 'Invite has expired' });
        }

        // Check if user email matches invite email
        if (user.email !== invite.email) {
             return res.status(403).json({ message: 'This invite is for another email address' });
        }

        // Add user to team members
        team.members.push({ user: user._id, role: invite.role });
        
        // Remove the utilized invite
        team.invites.splice(inviteIndex, 1);
        await team.save();

        // Update user
        await User.findByIdAndUpdate(user._id, { teamId: team._id });

        res.status(200).json({ message: 'Successfully joined the team', teamId: team._id });
    } catch (error) {
        next(error);
    }
};

export const removeMember = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const currentUser = await User.findById(req.user._id);
        
        if (!currentUser.teamId) return res.status(400).json({ message: 'You are not in a team' });

        const team = await Team.findById(currentUser.teamId);
        
        if (team.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only team owner can remove members' });
        }

        if (userId === team.owner.toString()) {
            return res.status(400).json({ message: 'Cannot remove the owner' });
        }

        const memberIndex = team.members.findIndex(m => m.user.toString() === userId);
        if (memberIndex === -1) {
            return res.status(404).json({ message: 'Member not found in team' });
        }

        team.members.splice(memberIndex, 1);
        await team.save();

        await User.findByIdAndUpdate(userId, { $unset: { teamId: 1 } });

        res.status(200).json({ message: 'Member removed successfully' });
    } catch (error) {
        next(error);
    }
};

export const withdrawInvite = async (req, res, next) => {
    try {
        const { token } = req.params;
        const currentUser = await User.findById(req.user._id);
        
        if (!currentUser.teamId) return res.status(400).json({ message: 'You are not in a team' });

        const team = await Team.findById(currentUser.teamId);
        
        if (team.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only team owner can withdraw invites' });
        }

        const initialLength = team.invites.length;
        team.invites = team.invites.filter(i => i.token !== token);

        if (team.invites.length === initialLength) {
            return res.status(404).json({ message: 'Invite not found' });
        }

        await team.save();

        res.status(200).json({ message: 'Invite withdrawn successfully' });
    } catch (error) {
        next(error);
    }
};
