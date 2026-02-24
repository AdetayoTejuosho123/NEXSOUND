import { verifyToken } from './verifyToken';

export default async function handler(req, res) {
    try {
        const user = await verifyToken(req);

        res.status(200).json({
            message: 'Authenticated successfully',
            user
        });

    } catch (error) {
        res.status(401).json({
            error: error.message
        });
    }
}