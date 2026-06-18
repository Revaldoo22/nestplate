import { IsUnique } from '../../common/validators/is-unique.validator';
import { Note } from '../entities/note.entity';
import { BaseNoteDto } from './base-note.dto';

export class CreateNoteDto extends BaseNoteDto {
  @IsUnique(Note)
  declare title: string;
}
