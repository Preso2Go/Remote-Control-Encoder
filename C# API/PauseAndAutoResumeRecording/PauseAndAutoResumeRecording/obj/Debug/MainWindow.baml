   M S B A M L   `   `   `  ����V  RPauseAndAutoResumeRecording, Version=1.0.0.0, Culture=neutral, PublicKeyToken=nullI)clr-namespace:PauseAndAutoResumeRecordingPauseAndAutoResumeRecording  5   	   ,    &PauseAndAutoResumeRecording.MainWindow   5   	   W SPresentationCore, Version=4.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35R NWindowsBase, Version=4.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35\ XPresentationFramework, Version=4.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35D 9http://schemas.microsoft.com/winfx/2006/xaml/presentation    5   	   R NSystem.Xaml, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089:x,http://schemas.microsoft.com/winfx/2006/xaml     5   	   @d2http://schemas.microsoft.com/expression/blend/2008     5   	   Jmc;http://schemas.openxmlformats.org/markup-compatibility/2006     5   	   ;local)clr-namespace:PauseAndAutoResumeRecording     5   	   -   5          � Title$  Pause recording��5   	   $��283.377��6!   $��798.5��62   $y�Visible=�6@    � 
ResizeMode$ CanMinimize=�6U    � 	Resources 5	       	  Pause 
 Resume  BlockedPause  BtnResumeStyle �� 
TargetType �� Property �� Value �� 
TargetType �� CornerRadius F�Name	 �� Stretch
 J� RenderTransformOrigin ��Name J� SnapsToDevicePixels  BtnPauseStyle  BtnBlockedPauseStyle��%r  &	        &	 �     &	 ;    &	 �    &	 �    &	 b	    �� 5
   
   $����file:///C:/Users/wg/documents/visual studio 2015/Projects/PauseAndAutoResumeRecording/PauseAndAutoResumeRecording/pausebutton.png��6   �� 5   
   $����file:///C:/Users/wg/documents/visual studio 2015/Projects/PauseAndAutoResumeRecording/PauseAndAutoResumeRecording/resumebutton.png��6   �� 5   
   $����file:///C:/Users/wg/documents/visual studio 2015/Projects/PauseAndAutoResumeRecording/PauseAndAutoResumeRecording/blockedpausebutton.png��6%   �� 5   
   " ��6'   .�5      ��  � �� �#009afd6+   �� 5       � ��
 �����6+   �� 5       � ��$ 15(�6)   �� 5       �@J�SnapsToDevicePixels . 64   �� 5       �@�Cursor$
 Hand��6'   �� 5       � �� 5      �� 5      " ��6&   .R�5      �� $ 7��6!   #��z��62   ._�5      � .+�5   "   F� $ PathIconLeft��6'   $
��21.5��6=   $
��Auto��6J   $
	 Fill=�6X   
�������$
��Left=�6t   $��40,19.637,0,17.637q�6�   4�������    р��Mф+
 x�O�dE ��P�dE ,� $
 0.5,0.5&�6�   F� 5   "   $ PathIcon��6'   $
��55.5��69   $
��Auto��6F   $
	 Fill=�6T   
�������$
��Left=�6p   $��70,19.637,0,17.637q�6�   4��������<R���=�x�O���Tn5����<R$
 0.5,0.5&�6  �� 5   "   $ MyContentPresenter��63   #��z��6O   $��Center=�6s   $��Center=�6�   $��0,0,0,0q�6�    . 6�   5      5      5      5!      5"      �� 5#   
   " ��6&   .�5$      ��  � �� �#009afd6+   �� 5%       � ��
 �����6+   �� 5&       � ��$ 15(�6)   �� 5'       �@J�SnapsToDevicePixels . 64   �� 5(       �@�Cursor$
 Hand��6'   �� 5*       � �� 5+      �� 5,      " ��6&   .R�5-      �� $ 7��6!   #��z��62   ._�5.      � .+�5/   "   F� $ PathIconLeft��6'   $
��21.5��6=   $
��Auto��6J   $
	 Fill=�6X   
�������$
��Left=�6t   $��47.5,19.637,0,17.637q�6�   4�������    р��Mф+
 x�O�dE ��P�dE ,� $
 0.5,0.5&�6�   F� 50   "   $ PathIconRight��6'   $
��21.5��6>   $
��Auto��6K   $
	 Fill=�6Y   
�������$
��Left=�6u   $��82.5,19.637,0,17.637q�6�   4�������    р��Mф+
 x�O�dE ��P�dE ,� $
 0.5,0.5&�6�   �� 51   "   $ MyContentPresenter��63   #��z��6O   $��Center=�6s   $��Center=�6�   $��0,0,0,0q�6�    . 6�   52      53      54      56      57      �� 58   
   " ��6-   .�59      ��  � �� �#6690a36+   �� 5:       � �� �#b7c4ca6+   �� 5;       � ��$ 15(�6)   �� 5<       �@J�SnapsToDevicePixels . 64   �� 5=       �@�Cursor$ No��6'   �� 5?       � �� 5@      �� 5A      " ��6&   .R�5B      �� $ 7��6!   #��z��62   ._�5C      � .+�5D   "   F� $ PathIconLeft��6'   $
��21.5��6=   $
��Auto��6J   $
	 Fill=�6X   ���	#FFB7C4CA$
��Left=�6x   $��47.5,19.637,0,17.637q�6�   4�������    р��Mф+
 x�O�dE ��P�dE ,� $
 0.5,0.5&�6�   F� 5E   "   $ PathIconRight��6'   $
��21.5��6>   $
��Auto��6K   $
	 Fill=�6Y   ���	#FFB7C4CA$
��Left=�6y   $��82.5,19.637,0,17.637q�6�   4�������    р��Mф+
 x�O�dE ��P�dE ,� $
 0.5,0.5&�6�   �� 5F   "   $ MyContentPresenter��63   #��z��6O   $��Center=�6s   $��Center=�6�   $��0,0,0,0q�6�    . 6�   5G      5H      5I      5K      5L      5M      .��5N      � .+�5O   
   �� -   5         ��Name$ txtpausemin��5O      $��68,30,363,132q�6)   $��Minutes pause:��6@   $��48(�6V   �� 5P   
   -   5         ��Name$ cobxNrMinutes��5P      $
��Left=�6*   $	��Top=�6E   $	��348��6]   $��
55,106,0,0q�6i   $��60��6�   $��32(�6�   $��1q�6�    �� 
IsReadOnly . {�. 6�   �� 5R   
   -   5         ��Name$ btnPauseResume��5R      $��530,73,99,72q�6L   ��6)   ��  �� Path$ ButtonImage�6b   �� 5S   
   -   5        $ MyTextBlock��5S      $��97,187,61,10q�6)   $��26.667(�6?   $�� ��6Q   5U      5V      