public class ServiceResult<T>
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public T? Data { get; set; }

    public static ServiceResult<T> SuccessResult(T data) =>
        new ServiceResult<T> { Success = true, Data = data };

    public static ServiceResult<T> Failure(string message) =>
        new ServiceResult<T> { Success = false, Message = message };
}
