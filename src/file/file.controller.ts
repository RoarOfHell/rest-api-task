import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { FileService } from './file.service';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import * as path from 'path';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

const multerOptions = {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, uuid() + ext);
      },
    }),
  };

@Controller('/file')
@UseGuards(JwtAuthGuard)
export class FileController {
  constructor(private files: FileService) {}

  @Post('/upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'file for download',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @UseInterceptors(FileInterceptor('file', multerOptions))
  upload(@UploadedFile() file: Express.Multer.File) {
    return this.files.create(file);
  }

  @Get('/list')
  list(
    @Query('page') page?: string,
    @Query('list_size') listSize?: string,
  ) {
    return this.files.list(
      page ? Number(page) : 1,
      listSize ? Number(listSize) : 10,
    );
  }

  @Delete('/delete/:id')
  delete(@Param('id') id: string) {
    return this.files.delete(Number(id));
  }

  @Get('/:id')
  get(@Param('id') id: string) {
    return this.files.get(Number(id));
  }

  @Get('/download/:id')
  async download(@Param('id') id: string, @Res() res: any) {
    const { file, fullPath } = await this.files.getDiskPath(Number(id));
    return res.download(fullPath, file.originalName);
  }

  @Put('/update/:id')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  update(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.files.update(Number(id), file);
  }
}
