import { UserRepo } from "../repository/user.repo";
export class UserService {
    userRepo;
    constructor() {
        this.userRepo = new UserRepo();
    }
    bulkGet = async () => {
        return this.userRepo.bulkGet();
    };
    create = async (user) => {
        return this.userRepo.create(user);
    };
    get = async (userId) => {
        return this.userRepo.get(userId);
    };
}
