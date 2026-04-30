export abstract class MapWithGC<K, V> extends Map<K, V> {
  public abstract gc(): void;
}
