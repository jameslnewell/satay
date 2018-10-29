import {EventEmitter} from 'events';
import {ObjectDiffStatusMap, ObjectDiffStatus, ObjectStats} from './types';

export interface UrlEvent {
  url: string;
}

export interface DiffEvent {
  diff: ObjectDiffStatusMap;
}

// export interface ObjectEvent extends ObjectStats {
//   status: ObjectDiffStatus;
//   upload: boolean;
//   delete: boolean;
// }

export class Emitter {
  private emitter: EventEmitter = new EventEmitter();

  on(event: 'bucket:created', listener: () => void): this;
  on(event: 'bucket:configured', listener: () => void): this;
  on(event: 'url', listener: (data: UrlEvent) => void): this;
  on(event: 'diff', listener: (data: DiffEvent) => void): this;
  // on(event: 'object:upload:started', listener: (data: ObjectEvent) => void): this;
  // on(event: 'object:upload:finished', listener: (data: ObjectEvent) => void): this;
  // on(event: 'object:delete:started', listener: (data: ObjectEvent) => void): this;
  // on(event: 'object:delete:finished', listener: (data: ObjectEvent) => void): this;
  on(event: 'done', listener: () => void): this;
  on(event: 'error', listener: (error: Error) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this {
    this.emitter.on(event, listener);
    return this;
  }

  off(event: 'bucket:created', listener: () => void): this;
  off(event: 'bucket:configured', listener: () => void): this;
  off(event: 'url', listener: (data: UrlEvent) => void): this;
  off(event: 'diff', listener: (data: DiffEvent) => void): this;
  // off(event: 'object:upload:started', listener: (data: ObjectEvent) => void): this;
  // off(event: 'object:upload:finished', listener: (data: ObjectEvent) => void): this;
  // off(event: 'object:delete:started', listener: (data: ObjectEvent) => void): this;
  // off(event: 'object:delete:finished', listener: (data: ObjectEvent) => void): this;
  off(event: 'done', listener: () => void): this;
  off(event: 'error', listener: (error: Error) => void): this;
  off(event: string | symbol, listener: (...args: any[]) => void): this {
    this.emitter.on(event, listener);
    return this;
  }

  emit(event: 'bucket:created'): boolean;
  emit(event: 'bucket:configured'): boolean;
  emit(event: 'url', data: UrlEvent): boolean;
  emit(event: 'diff', data: DiffEvent): boolean;
  // emit(event: 'object:upload:started', data: ObjectEvent): boolean;
  // emit(event: 'object:upload:finished', data: ObjectEvent): boolean;
  // emit(event: 'object:delete:started', data: ObjectEvent): boolean;
  // emit(event: 'object:delete:finished', data: ObjectEvent): boolean;
  emit(event: 'done'): boolean;
  emit(event: 'error', error: Error): boolean;
  emit(event: string | symbol, ...args: any[]): boolean {
    return this.emitter.emit(event, ...args);
  }
}
