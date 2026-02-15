import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Injectable, Logger } from "@nestjs/common";
import * as fs from 'fs-extra';
import * as zlib from 'zlib';
import * as tar from 'tar';

export abstract class UserDataService {

    /**
     * Load the user data from persistent storage. If no user data associated to the ID, doesn't do anything.
     * 
     * @param id The ID of the user data to load.
     * @param user_data_folder The folder to load the user data into.
     */
    abstract load(id: string, user_data_folder: string): Promise<void>;

    /**
     * Save the user data to a persistent storage.
     * 
     * @param id The ID used to stored the user data in persistent storage.
     * @param user_data_folder The folder containing the user data to save.
     */
    abstract save(id: string, user_data_folder: string): Promise<void>;

}

@Injectable()
export class LocalUserDataService extends UserDataService {

    private static readonly USER_DATA_FOLDER = '/blitzbrowser/user-data';

    readonly #logger = new Logger(LocalUserDataService.name);

    async load(id: string, user_data_folder: string): Promise<void> {
        const folder = `${LocalUserDataService.USER_DATA_FOLDER}/${id}`;

        if (!await fs.pathExists(folder)) {
            return;
        }

        try {
            await fs.move(folder, user_data_folder, { overwrite: true });
        } catch (e) {
            this.#logger.error(`Error while loading user data ${folder}`, e);
        }
    }

    async save(id: string, user_data_folder: string): Promise<void> {
        const folder = `${LocalUserDataService.USER_DATA_FOLDER}/${id}`;

        await fs.rm(folder, { recursive: true, force: true });

        try {
            await fs.move(user_data_folder, folder);
        } catch (e) {
            this.#logger.error(`Error while save ${user_data_folder} to user data ${folder}`, e);
        }
    }

}

@Injectable()
export class S3UserDataService extends UserDataService {

    readonly #logger = new Logger(S3UserDataService.name);

    constructor(
        private readonly s3_client: S3Client,
    ) {
        super();
    }

    async load(id: string, user_data_folder: string) {
        try {
            const tar_file = `/tmp/${crypto.randomUUID()}`;
            const response = await this.s3_client.send(new GetObjectCommand({
                Bucket: process.env.S3_USER_DATA_BUCKET,
                Key: id,
            }));

            await fs.writeFile(tar_file, await response.Body.transformToByteArray());
            await this.untarUserDataFolder(tar_file, user_data_folder);
            await fs.rm(tar_file);

            this.#logger.log(`Downloaded user data ${id} folder:${user_data_folder}`);
        } catch (e) {
            if (e.Code === 'NoSuchKey') {
                return;
            }

            throw e;
        }
    }

    async save(id: string, user_data_folder: string) {
        const tar_file = await this.tarUserDataFolder(user_data_folder);

        await this.s3_client.send(new PutObjectCommand({
            Bucket: process.env.S3_USER_DATA_BUCKET,
            Key: id,
            Body: await fs.readFile(tar_file)
        }));

        await fs.rm(tar_file);

        this.#logger.log(`Uploaded user data ${id} folder:${user_data_folder}`);
    }

    /**
     * 
     * @param user_data_folder The user data folder to tar
     * @returns The tar file path
     */
    protected async tarUserDataFolder(user_data_folder: string): Promise<string> {
        const tar_file = `${crypto.randomUUID()}.tar.gz`;

        await tar.create({
            gzip: true,
            file: tar_file,
            cwd: user_data_folder
        }, ['.']);

        return tar_file;
    }

    protected async untarUserDataFolder(tar_file: string, user_data_folder: string) {
        await new Promise((res, rej) => {
            fs.createReadStream(tar_file)
                .pipe(zlib.createGunzip())
                .pipe(tar.extract({ cwd: user_data_folder }))
                .on('finish', () => {
                    res(undefined);
                })
                .on('error', (err) => {
                    rej(err);
                });
        });
    }

}