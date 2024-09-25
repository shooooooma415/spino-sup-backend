import { RepositoryRepo } from "../repository/repository.repo";
export class RepositoryService {
    repositoryRepo;
    constructor() {
        this.repositoryRepo = new RepositoryRepo();
    }
    create = async (data) => {
        return this.repositoryRepo.create(data);
    };
    bulkGet = async (userId) => {
        return this.repositoryRepo.getbyUserId(userId);
    };
}
