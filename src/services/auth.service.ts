import { prisma } from "@/lib/prisma";
import { Prisma, User } from "@prisma/client";

class AuthService {
    static async userInDatabase({ email }: { email: string }): Promise<boolean> {
        try {
            const user = await prisma.user.findUnique({
                where: { email }
            });

            return user ? true : false;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                throw new Error("Database request failed");
            }
            throw new Error(`An unexpected error occurred while fetching the user: ${error}`);
        }
    }

    static async createUser({ id, email }: { id: string, email: string }): Promise<User> {
        try {
            const newUser = await prisma.user.create({
                data: {
                    id,
                    email,
                }
            });

            return newUser;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                throw new Error("Database request failed");
            }
            throw new Error("An unexpected error occurred while creating a new user");
        }
    }
}

export default AuthService;