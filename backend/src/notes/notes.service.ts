import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Note } from './entities/note.entity';
import { BaseService } from '../common/services/base.service';

@Injectable()
export class NotesService extends BaseService<Note> {
  constructor(
    @InjectRepository(Note)
    private readonly noteRepository: Repository<Note>,
  ) {
    super(noteRepository, 'Note', ['title', 'content']);
  }

  /**
   * Create a note and emit a `note.created` domain event so the notifications
   * listener can alert admins. Side-effects stay decoupled — the service never
   * touches the gateway directly. `actorId` is forwarded so the listener can
   * exclude the creator from their own notification.
   */
  async createNote(dto: DeepPartial<Note>, actorId?: number): Promise<Note> {
    const saved = await super.create(dto);

    this.eventEmitter.emit('note.created', {
      noteId: saved.id,
      title: saved.title,
      actorId,
    });

    return saved;
  }
}
