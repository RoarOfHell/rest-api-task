import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from './entities/file.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileService {
  private uploadDir = path.join(process.cwd(), 'uploads');

  constructor(@InjectRepository(FileEntity) private repo: Repository<FileEntity>) {
    if (!fs.existsSync(this.uploadDir)) fs.mkdirSync(this.uploadDir);
  }

  async create(file: Express.Multer.File) {
    const ext = path.extname(file.originalname).replace('.', '');

    return this.repo.save({
      originalName: file.originalname,
      extension: ext,
      mimeType: file.mimetype,
      size: file.size,
      storageName: file.filename,
    });
  }

  async list(page = 1, listSize = 10) {
    const skip = (page - 1) * listSize;

    const [items, total] = await this.repo.findAndCount({
      order: { id: 'DESC' },
      take: listSize,
      skip,
    });

    return {
      page,
      list_size: listSize,
      total,
      items,
    };
  }

  async get(id: number) {
    const file = await this.repo.findOne({ where: { id } });
    if (!file) throw new NotFoundException('File not found');
    return file;
  }

  async delete(id: number) {
    const file = await this.get(id);

    const fullPath = path.join(this.uploadDir, file.storageName);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);

    await this.repo.delete({ id });

    return { ok: true };
  }

  async getDiskPath(id: number) {
    const file = await this.get(id);
    return {
      file,
      fullPath: path.join(this.uploadDir, file.storageName),
    };
  }

  async update(id: number, newFile: Express.Multer.File) {
    const old = await this.get(id);

    const oldPath = path.join(this.uploadDir, old.storageName);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

    const ext = path.extname(newFile.originalname).replace('.', '');

    old.originalName = newFile.originalname;
    old.extension = ext;
    old.mimeType = newFile.mimetype;
    old.size = newFile.size;
    old.storageName = newFile.filename;

    return this.repo.save(old);
  }
}
