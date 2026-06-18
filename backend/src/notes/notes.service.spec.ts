import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { describe, beforeEach, it, expect, jest } from 'bun:test';
import { NotesService } from './notes.service';
import { Note } from './entities/note.entity';

describe('NotesService', () => {
  let service: NotesService;
  let noteRepository: Repository<Note>;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        {
          provide: getRepositoryToken(Note),
          useValue: {
            findAndCount: jest.fn().mockResolvedValue([[], 0]),
            create: jest.fn((dto: Partial<Note>) => dto),
            save: jest.fn((entity: Partial<Note>) =>
              Promise.resolve({ id: 1, ...entity }),
            ),
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = module.get<NotesService>(NotesService);
    noteRepository = module.get<Repository<Note>>(getRepositoryToken(Note));
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should persist a note', async () => {
      const dto = { title: 'My note', content: 'Hello world' };

      const result = await service.create(dto);

      expect(noteRepository.save).toHaveBeenCalled();
      expect(result).toMatchObject(dto);
    });
  });

  describe('createNote', () => {
    it('should emit note.created with the actorId', async () => {
      const dto = { title: 'My note', content: 'Hello world' };

      const result = await service.createNote(dto, 42);

      expect(noteRepository.save).toHaveBeenCalled();
      expect(result).toMatchObject(dto);
      expect(eventEmitter.emit).toHaveBeenCalledWith('note.created', {
        noteId: 1,
        title: 'My note',
        actorId: 42,
      });
    });
  });

  describe('findAllPaginated', () => {
    it('should default to createdAt DESC ordering', async () => {
      await service.findAllPaginated(1, 10);
      expect(noteRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ order: { createdAt: 'DESC' } }),
      );
    });
  });
});
