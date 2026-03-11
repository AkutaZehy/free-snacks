@echo off
echo 正在删除百度网盘右键菜单...
reg delete "HKEY_CLASSES_ROOT\Directory\shellex\ContextMenuHandlers\YunShellExt" /f
reg delete "HKEY_CLASSES_ROOT\*\shellex\ContextMenuHandlers\YunShellExt" /f
echo 删除完成！
pause