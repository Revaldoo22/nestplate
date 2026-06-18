import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';
import { NoFilesInterceptor } from '@nestjs/platform-express';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';
import { CacheService } from '../common/cache/cache.service';
import { PaginationParamsDto } from '../common/dto/pagination-params.dto';
import { PaginatedResponseDto } from '../common/services/base.service';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from './entities/note.entity';
import type { IAuthRequest } from '../auth/interfaces/auth-request.interface';

class PaginatedNoteResponse extends PaginatedResponseDto<Note> {
  @ApiProperty({ type: [Note] })
  declare data: Note[];
}

@ApiTags('Notes')
@ApiBearerAuth()
@Controller('notes')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class NotesController {
  constructor(
    private readonly notesService: NotesService,
    private readonly cacheService: CacheService,
  ) {}

  @Post()
  @Permissions('notes.create')
  @ApiOperation({ summary: 'Create a new note' })
  @ApiResponse({ status: 201, type: Note })
  @UseInterceptors(NoFilesInterceptor())
  async create(@Body() createNoteDto: CreateNoteDto, @Req() req: IAuthRequest) {
    const result = await this.notesService.createNote(
      createNoteDto,
      req.user.userId,
    );
    await this.cacheService.clearKeys('*/notes*');
    return result;
  }

  @Get()
  @Permissions('notes.read')
  @ApiOperation({ summary: 'Get all notes' })
  @ApiResponse({ status: 200, type: PaginatedNoteResponse })
  @UseInterceptors(CacheInterceptor)
  findAll(@Query() params: PaginationParamsDto) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    if (params.paginated) {
      return this.notesService.findAllPaginated(
        page,
        limit,
        params.search,
        params.sort,
        params.direction,
      );
    }
    return this.notesService.findAll();
  }

  @Get(':id')
  @Permissions('notes.read')
  @ApiOperation({ summary: 'Get a note by ID' })
  @ApiResponse({ status: 200, type: Note })
  @UseInterceptors(CacheInterceptor)
  findOne(@Param('id') id: string) {
    return this.notesService.findOne(+id);
  }

  @Patch(':id')
  @Permissions('notes.update')
  @ApiOperation({ summary: 'Update a note' })
  @ApiResponse({ status: 200, type: Note })
  @UseInterceptors(NoFilesInterceptor())
  async update(@Param('id') id: string, @Body() updateNoteDto: UpdateNoteDto) {
    const result = await this.notesService.update(+id, updateNoteDto);
    await this.cacheService.clearKeys('*/notes*');
    return result;
  }

  @Delete(':id')
  @Permissions('notes.delete')
  @ApiOperation({ summary: 'Delete a note' })
  @ApiResponse({ status: 200 })
  async remove(@Param('id') id: string) {
    const result = await this.notesService.remove(+id);
    await this.cacheService.clearKeys('*/notes*');
    return result;
  }
}
